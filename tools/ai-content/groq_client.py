"""Groq API client wrapper for Stirio AI content tooling.

Thin layer around the official `groq` SDK that adds:
  - dotenv loading so local runs pick up tools/ai-content/.env
  - exponential backoff on 429 / 5xx (tenacity)
  - default model + max-tokens that fit Stirio's translation/review batches
  - usage tally so each run logs total tokens + remaining daily bucket

The SDK is OpenAI-compatible; we use `chat.completions.create` with JSON-mode
so callers always get parseable JSON back.
"""

from __future__ import annotations

import json
import logging
import os
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
DEFAULT_MODEL = "llama-3.3-70b-versatile"
DEFAULT_MAX_TOKENS = 4096

logger = logging.getLogger("stirio.ai.groq")


@dataclass
class UsageTally:
    """Aggregate token + request counts across a run."""

    requests: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    rate_limit_remaining_requests: Optional[str] = None
    rate_limit_remaining_tokens: Optional[str] = None

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
    api_key: Optional[str] = None
    _client: Optional[Groq] = field(default=None, init=False, repr=False)
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

    @retry(
        retry=retry_if_exception_type((RateLimitError, APIStatusError)),
        stop=stop_after_attempt(int(os.environ.get("GROQ_MAX_RETRIES", "4"))),
        wait=wait_exponential(multiplier=2, min=2, max=30),
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
        self.usage.add(response)
        # Headers expose rate-limit info but the Groq SDK doesn't surface them on
        # the response object — they're available on the underlying httpx
        # response via `with_raw_response`. Skipping for now; the daily bucket
        # is generous enough that we only care about retry-after on 429.
        content = response.choices[0].message.content or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("Groq returned non-JSON despite json_object mode: %r", content[:200])
            raise RuntimeError("Groq response was not valid JSON") from exc
