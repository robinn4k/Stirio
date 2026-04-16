// ─── Shared utilities ────────────────────────────────────────
// Small helpers reused across modules. Keep this file dependency-light.

import { t } from './lang.js';

/**
 * Fisher-Yates shuffle (unbiased). Returns a new array; does not mutate input.
 * Replaces the `Array.sort(() => Math.random() - 0.5)` idiom which is biased.
 */
export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Escape a string for safe interpolation into innerHTML contexts.
 * Prefer textContent/appendChild; use this only when building HTML strings.
 */
export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/**
 * Promise-based, themed confirmation modal that replaces window.confirm().
 * Returns true if the user confirms, false otherwise. Gracefully falls back to
 * window.confirm() if the modal DOM is missing (e.g. in tests).
 *
 * Options:
 *   okText / cancelText — override button labels.
 */
export function showConfirm(message, options = {}) {
  const modal = document.getElementById('confirm-modal');
  const msgEl = document.getElementById('confirm-modal-msg');
  const okBtn = document.getElementById('confirm-modal-ok');
  const cancelBtn = document.getElementById('confirm-modal-cancel');

  if (!modal || !msgEl || !okBtn || !cancelBtn) {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm
      ? window.confirm(message)
      : false);
  }

  msgEl.textContent = message;
  okBtn.textContent = options.okText || t('confirm.ok');
  cancelBtn.textContent = options.cancelText || t('confirm.cancel');
  modal.classList.remove('hidden');

  return new Promise(resolve => {
    const cleanup = (result) => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (e) => { if (e.target === modal) cleanup(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
      else if (e.key === 'Enter') cleanup(true);
    };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);
    okBtn.focus();
  });
}
