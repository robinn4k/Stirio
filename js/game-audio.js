// ─── PROCEDURAL AUDIO ENGINE ─────────────────────────────────
// Generates all game sounds via Web Audio API — no external files needed.

let ctx = null;
let muted = false;

function init() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (_) { /* Web Audio not supported */ }
}

function _osc(freq, type, dur, vol = 0.25, delay = 0) {
  if (!ctx || muted) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + delay);
  o.stop(ctx.currentTime + delay + dur + 0.05);
}

function _noise(dur, vol = 0.15) {
  if (!ctx || muted) return;
  const len = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(g).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + dur + 0.01);
}

// ─── SOUND EFFECTS ──────────────────────────────────────────

function sfxCorrect() {
  _osc(523, 'sine', 0.1, 0.2);          // C5
  _osc(659, 'sine', 0.12, 0.2, 0.08);   // E5
}

function sfxWrong() {
  _osc(220, 'sawtooth', 0.08, 0.12);
  _osc(160, 'sawtooth', 0.12, 0.12, 0.06);
}

function sfxSlice() {
  _noise(0.06, 0.18);
  _osc(800, 'sine', 0.04, 0.1);
}

function sfxSwipe() {
  _noise(0.1, 0.1);
}

function sfxCombo(level) {
  const base = 440;
  const vol = Math.min(0.15 + level * 0.02, 0.25);
  _osc(base, 'sine', 0.12, vol);
  _osc(base * 1.25, 'sine', 0.12, vol, 0.05);
  if (level >= 5) _osc(base * 1.5, 'sine', 0.12, vol, 0.1);
  if (level >= 8) _osc(base * 2, 'sine', 0.15, vol, 0.15);
}

function sfxDrop() {
  _osc(80, 'sine', 0.06, 0.2);
}

function sfxUIClick() {
  _osc(1200, 'triangle', 0.03, 0.1);
}

function sfxTimerWarn() {
  _osc(440, 'square', 0.08, 0.1);
}

function sfxVictory() {
  _osc(523, 'sine', 0.1, 0.2);          // C5
  _osc(659, 'sine', 0.1, 0.2, 0.1);     // E5
  _osc(784, 'sine', 0.1, 0.2, 0.2);     // G5
  _osc(1047, 'sine', 0.15, 0.25, 0.3);  // C6
}

function sfxGameOver() {
  _osc(392, 'sine', 0.15, 0.15);         // G4
  _osc(330, 'sine', 0.15, 0.15, 0.12);   // E4
  _osc(262, 'sine', 0.2, 0.15, 0.24);    // C4
}

export const GameAudio = {
  init, sfxCorrect, sfxWrong, sfxSlice, sfxSwipe, sfxCombo,
  sfxDrop, sfxUIClick, sfxTimerWarn, sfxVictory, sfxGameOver,
  get muted() { return muted; },
  set muted(v) { muted = v; },
};
