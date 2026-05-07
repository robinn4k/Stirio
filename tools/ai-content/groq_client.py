"""Groq API client wrapper for Stirio AI content tooling.

Thin layer around the official `groq` SDK that adds:
  - dotenv loading so local runs pick up tools/ai-content/.env
  - exponential backoff on 429 / 5xx (tenacity)
  - explicit min-spacing between requests so we don't blow Groq's
    free-tier TPM bucket and turn a 1-min job into a 10-min one
  - default model + max-tokens that fit Stirio's translation/review batches
  - usage tally so each run logs total tokens + remaining daily bucket

The SDK is OpenAI-compatible; we use `chat.completions.create` with JSON-mode
so callers always get parseable JSON back.
"""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from groq import APIStatusError, Groq, RateLimitError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

ROOT = Path(__file__).resolve().parent
# Groq free tier (2026-05): llama-3.1-8b-instant has ~30k TPM vs 6k TPM on
# llama-3.3-70b-versatile. For batched i18n translation 8b is plenty
# (the source strings are short, the task is mechanical) and the 5x TPM
# headroom keeps a full corpus run inside one minute. Override per-call
# via --model on the CLI when you need 70b for review/complete.
DEFAULT_MODEL = "llama-3.1-8b-instant"
DEFAULT_MAX_TOKENS = 4096
# Pacing between consecutive requests. 1.5s × 25 batches × 4 langs ≈ 2.5 min,
# which sits well under the 30-RPM hard cap and leaves the TPM bucket time
# to refill. Without this the SDK fires back-to-back, hits 429 mid-batch,
# tenacity waits 30s+ each time, and the run effectively serialises anyway —
# this version just front-loads the wait so retries become rare.
DEFAULT_REQUEST_SPACING_S = 1.5

logger = logging.getLogger("stirio.ai.groq")


@dataclass
class UsageTally:
    """Aggregate token + request counts across a run."""

    requests: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    rate_limit_retries: int = 0

    def add(self, response: Any) -> None:
        self.requests += 1
        usage = getattr(response, "usage", None)
        if usage:
            self.prompt_tokens += getattr(usage, "prompt_tokens", 0) or 0
            self.completion_tokens += getattr(usage, "completion_tokens", 0) or 0


@dataclass
class GroqClient:
    """Stirio's wrapper. One instance per CLI invocation."""

    model: str = DEFAULT_MODEL
    max_tokens: int = DEFAULT_MAX_TOKENS
    temperature: float = 0.2  # low — we want deterministic translations
    min_request_spacing_s: float = DEFAULT_REQUEST_SPACING_S
    api_key: Optional[str] = None
    _client: Optional[Groq] = field(default=None, init=False, repr=False)
    _last_request_at: float = field(default=0.0, init=False, repr=False)
    usage: UsageTally = field(default_factory=UsageTally)

    def __post_init__(self) -> None:
        load_dotenv(ROOT / ".env")
        key = self.api_key or os.environ.get("GROQ_API_KEY")
        if not key:
            raise RuntimeError(
                "GROQ_API_KEY not set. Copy tools/ai-content/.env.example to .env "
                "and paste your key from https://console.groq.com/keys"
            )
        self._client = Groq(api_key=key)
        env_model = os.environ.get("GROQ_MODEL")
        if env_model:
            self.model = env_model
        env_spacing = os.environ.get("GROQ_REQUEST_SPACING_S")
        if env_spacing:
            try:
                self.min_request_spacing_s = float(env_spacing)
            except ValueError:
                logger.warning(
                    "Ignoring invalid GROQ_REQUEST_SPACING_S=%r", env_spacing
                )

    def _wait_for_spacing(self) -> None:
        if self.min_request_spacing_s <= 0:
            return
        elapsed = time.monotonic() - self._last_request_at
        deficit = self.min_request_spacing_s - elapsed
        if deficit > 0:
            time.sleep(deficit)

    @retry(
        retry=retry_if_exception_type((RateLimitError, APIStatusError)),
        stop=stop_after_attempt(int(os.environ.get("GROQ_MAX_RETRIES", "4"))),
        # Bumped max from 30s → 60s: when the TPM bucket is fully drained
        # Groq's reset header asks for ~45-60s, and tenacity capping at 30s
        # forces another retry cycle that fails immediately.
        wait=wait_exponential(multiplier=2, min=2, max=60),
        reraise=True,
    )
    def chat_json(
        self,
        system: str,
        user: str,
        *,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None,
    ) -> dict:
        """Call Groq with JSON mode and return the parsed dict.

        Raises on HTTP errors that survive the retry policy (e.g. invalid key,
        repeated 5xx). Caller is expected to catch + log per-batch failures so a
        single bad batch doesn't abort a full run.
        """
        assert self._client is not None
        self._wait_for_spacing()
        try:
            response = self._client.chat.completions.create(
                model=model or self.model,
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
        except RateLimitError:
            self.usage.rate_limit_retries += 1
            raise
        finally:
            self._last_request_at = time.monotonic()
        self.usage.add(response)
        content = response.choices[0].message.content or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("Groq returned non-JSON despite json_object mode: %r", content[:200])
            raise RuntimeError("Groq response was not valid JSON") from exc
