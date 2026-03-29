// ─── Telegram Mini App Integration ───────────────────────────────────
// Detects if running inside Telegram and adapts Stirio accordingly.
// Works as both standalone PWA and Telegram Mini App.

const tg = window.Telegram?.WebApp;

export const isTelegram = !!tg?.initData;

// ─── Initialize Telegram Mini App ────────────────────────────────────
export function initTelegram() {
  if (!isTelegram) return;

  // Signal Telegram that the app is ready
  tg.ready();

  // Expand to full height
  tg.expand();

  // Apply Telegram theme
  applyTelegramTheme();

  // Listen for theme changes
  tg.onEvent('themeChanged', applyTelegramTheme);

  // Listen for viewport changes
  tg.onEvent('viewportChanged', handleViewportChange);

  // Setup back button behavior
  tg.BackButton.onClick(() => {
    window.dispatchEvent(new CustomEvent('telegram-back'));
  });

  // Enable haptic feedback
  enableHaptics();

  // Request fullscreen for immersive experience
  if (tg.requestFullscreen) {
    try { tg.requestFullscreen(); } catch (e) { /* not supported */ }
  }
}

// ─── Telegram Theme → CSS Variables ──────────────────────────────────
function applyTelegramTheme() {
  if (!tg?.themeParams) return;
  const tp = tg.themeParams;
  const root = document.documentElement;

  // Map Telegram theme params to Stirio CSS variables
  if (tp.bg_color) root.style.setProperty('--bg', tp.bg_color);
  if (tp.secondary_bg_color) root.style.setProperty('--surface', tp.secondary_bg_color);
  if (tp.text_color) root.style.setProperty('--text', tp.text_color);
  if (tp.hint_color) root.style.setProperty('--text-muted', tp.hint_color);
  if (tp.link_color) root.style.setProperty('--gold', tp.link_color);
  if (tp.button_color) root.style.setProperty('--primary', tp.button_color);
  if (tp.button_text_color) root.style.setProperty('--primary-text', tp.button_text_color);

  // Set color scheme
  document.documentElement.setAttribute('data-theme', tg.colorScheme || 'dark');
}

// ─── Viewport Handling ───────────────────────────────────────────────
function handleViewportChange() {
  if (!tg) return;
  const vh = tg.viewportStableHeight || tg.viewportHeight;
  if (vh) {
    document.documentElement.style.setProperty('--tg-viewport-height', vh + 'px');
  }
}

// ─── Haptic Feedback ─────────────────────────────────────────────────
function enableHaptics() {
  if (!tg?.HapticFeedback) return;

  // Store reference globally for other modules to use
  window._tgHaptic = tg.HapticFeedback;
}

export function hapticImpact(style = 'light') {
  // style: 'light', 'medium', 'heavy', 'rigid', 'soft'
  if (window._tgHaptic) {
    window._tgHaptic.impactOccurred(style);
  }
}

export function hapticNotification(type = 'success') {
  // type: 'error', 'success', 'warning'
  if (window._tgHaptic) {
    window._tgHaptic.notificationOccurred(type);
  }
}

export function hapticSelection() {
  if (window._tgHaptic) {
    window._tgHaptic.selectionChanged();
  }
}

// ─── Telegram Back Button ────────────────────────────────────────────
export function showBackButton() {
  if (isTelegram) tg.BackButton.show();
}

export function hideBackButton() {
  if (isTelegram) tg.BackButton.hide();
}

// ─── Telegram User Data ──────────────────────────────────────────────
export function getTelegramUser() {
  if (!isTelegram) return null;
  const user = tg.initDataUnsafe?.user;
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name || '',
    username: user.username || '',
    languageCode: user.language_code || 'en',
    photoUrl: user.photo_url || null,
    displayName: [user.first_name, user.last_name].filter(Boolean).join(' '),
  };
}

// ─── Share Results ───────────────────────────────────────────────────
export function shareTelegram(text) {
  if (!isTelegram) return false;
  // Use Telegram's native share via inline query
  if (tg.switchInlineQuery) {
    tg.switchInlineQuery(text, ['users', 'groups']);
    return true;
  }
  return false;
}

// ─── Main Button (bottom CTA) ────────────────────────────────────────
export function setMainButton(text, onClick) {
  if (!isTelegram) return;
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
}

export function hideMainButton() {
  if (isTelegram) tg.MainButton.hide();
}

// ─── Cloud Storage (persist data across devices) ─────────────────────
export async function cloudGet(key) {
  if (!isTelegram || !tg.CloudStorage) return null;
  return new Promise(resolve => {
    tg.CloudStorage.getItem(key, (err, val) => {
      resolve(err ? null : val);
    });
  });
}

export async function cloudSet(key, value) {
  if (!isTelegram || !tg.CloudStorage) return false;
  return new Promise(resolve => {
    tg.CloudStorage.setItem(key, value, (err) => {
      resolve(!err);
    });
  });
}

// ─── Safe Area Handling ──────────────────────────────────────────────
export function getSafeAreaInsets() {
  if (!isTelegram) return { top: 0, bottom: 0, left: 0, right: 0 };
  const sa = tg.safeAreaInset || {};
  const csa = tg.contentSafeAreaInset || {};
  return {
    top: (sa.top || 0) + (csa.top || 0),
    bottom: (sa.bottom || 0) + (csa.bottom || 0),
    left: (sa.left || 0) + (csa.left || 0),
    right: (sa.right || 0) + (csa.right || 0),
  };
}
