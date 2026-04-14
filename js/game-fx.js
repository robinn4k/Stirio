// ─── ENHANCED VISUAL FX FOR MINI-GAMES ──────────────────────
// Procedural textures, particle systems, screen effects, backgrounds.
// All generated at runtime — zero external assets.

const FONT = 'Nunito, sans-serif';

// ─── TEXTURE GENERATORS ─────────────────────────────────────

const _textureCache = new Set();

function _ensureTexture(scene, key, drawFn, w, h) {
  if (_textureCache.has(key) && scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  drawFn(g);
  g.generateTexture(key, w, h);
  g.destroy();
  _textureCache.add(key);
  return key;
}

export function createGlowTexture(scene, key, radius, color) {
  return _ensureTexture(scene, key, (g) => {
    const steps = 12;
    for (let i = steps; i >= 0; i--) {
      const r = radius * (i / steps);
      const a = 0.3 * (1 - i / steps);
      g.fillStyle(color, a);
      g.fillCircle(radius, radius, r);
    }
  }, radius * 2, radius * 2);
}

export function createSoftParticle(scene, key, radius) {
  return _ensureTexture(scene, key, (g) => {
    const steps = 8;
    for (let i = steps; i >= 0; i--) {
      const r = radius * (i / steps);
      const a = 0.8 * (1 - i / steps);
      g.fillStyle(0xffffff, a);
      g.fillCircle(radius, radius, r);
    }
  }, radius * 2, radius * 2);
}

export function createSparkTexture(scene, key) {
  return _ensureTexture(scene, key, (g) => {
    g.fillStyle(0xffffff, 0.9);
    // Diamond shape - elongated
    g.fillTriangle(8, 0, 4, 16, 12, 16); // top
    g.fillTriangle(4, 16, 8, 32, 12, 16); // bottom
  }, 16, 32);
}

// ─── ENHANCED PARTICLE SYSTEMS ──────────────────────────────

export function particleBurstPro(scene, x, y, count, color, opts = {}) {
  const {
    emoji, spread = 70, duration = 500, ring = true,
    flash = true, palette, sizeMin = 3, sizeMax = 7,
  } = opts;

  // Layer 1: Inner flash
  if (flash) {
    const fl = scene.add.circle(x, y, 8, 0xffffff, 0.7);
    scene.tweens.add({
      targets: fl, scale: 3, alpha: 0, duration: 120,
      ease: 'Power2', onComplete: () => fl.destroy(),
    });
  }

  // Layer 2: Expanding ring
  if (ring) {
    const rg = scene.add.circle(x, y, 10, color, 0).setStrokeStyle(2.5, color, 0.6);
    scene.tweens.add({
      targets: rg, scale: spread / 10, alpha: 0,
      duration: duration * 0.7, ease: 'Power2',
      onComplete: () => rg.destroy(),
    });
  }

  // Layer 3: Particle spray
  const colors = palette || [color, 0xffffff, color];
  for (let i = 0; i < count; i++) {
    const size = Phaser.Math.Between(sizeMin, sizeMax);
    const c = Phaser.Math.RND.pick(colors);
    const p = scene.add.circle(x, y, size, c, 0.85);
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.4, 0.4);
    const dist = Phaser.Math.Between(spread * 0.3, spread);
    const rot = Phaser.Math.FloatBetween(-180, 180);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist - Phaser.Math.Between(5, 20),
      alpha: 0, scale: Phaser.Math.FloatBetween(0, 0.3), rotation: rot,
      duration: Phaser.Math.Between(duration * 0.6, duration),
      ease: 'Power2', onComplete: () => p.destroy(),
    });
  }

  // Optional emoji particle
  if (emoji) {
    const ep = scene.add.text(x, y, emoji, { fontSize: '28px' }).setOrigin(0.5);
    scene.tweens.add({
      targets: ep, y: y - 60, alpha: 0, scale: 1.6,
      duration: 550, ease: 'Power2', onComplete: () => ep.destroy(),
    });
  }
}

export function sparkBurst(scene, x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const spark = scene.add.rectangle(x, y, 2, Phaser.Math.Between(8, 16), color, 0.9);
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.2, 0.2);
    spark.rotation = angle;
    const dist = Phaser.Math.Between(30, 80);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0, scaleY: 0.3,
      duration: Phaser.Math.Between(300, 500),
      ease: 'Power3', onComplete: () => spark.destroy(),
    });
  }
}

export function fireBurst(scene, x, y) {
  const palette = [0xff6b35, 0xffaa00, 0xff4444, 0xffdd57];
  for (let i = 0; i < 16; i++) {
    const c = Phaser.Math.RND.pick(palette);
    const size = Phaser.Math.Between(3, 8);
    const p = scene.add.circle(x, y, size, c, 0.9);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const dist = Phaser.Math.Between(20, 70);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist - Phaser.Math.Between(20, 50),
      alpha: 0, scale: 0,
      duration: Phaser.Math.Between(400, 700),
      ease: 'Power2', onComplete: () => p.destroy(),
    });
  }
}

// ─── TEXT EFFECTS ────────────────────────────────────────────

export function floatingScoreText(scene, x, y, text, opts = {}) {
  const {
    color = '#34d399', fontSize = '18px', glowColor = '#000000',
    duration = 800, drift = Phaser.Math.Between(-15, 15),
  } = opts;

  // Glow/shadow behind
  const shadow = scene.add.text(x + 1, y + 1, text, {
    fontFamily: FONT, fontSize, color: glowColor, fontStyle: 'bold',
  }).setOrigin(0.5).setAlpha(0.4);

  // Main text
  const ft = scene.add.text(x, y, text, {
    fontFamily: FONT, fontSize, color, fontStyle: 'bold',
  }).setOrigin(0.5).setScale(0);

  const targets = [ft, shadow];

  // Scale up bounce
  scene.tweens.add({
    targets, scale: 1.25, duration: 100, ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets, scale: 1, duration: 80, ease: 'Power2',
        onComplete: () => {
          // Float up and fade
          scene.tweens.add({
            targets, y: y - 70, x: x + drift, alpha: 0,
            duration: duration - 180, ease: 'Power2',
            onComplete: () => { ft.destroy(); shadow.destroy(); },
          });
        },
      });
    },
  });
}

export function rollingCounter(scene, textObj, from, to, duration = 600) {
  const obj = { val: from };
  scene.tweens.add({
    targets: obj, val: to, duration, ease: 'Power2',
    onUpdate: () => { textObj.setText(`${Math.round(obj.val)} pts`); },
  });
}

// ─── SCREEN EFFECTS ─────────────────────────────────────────

export function screenShakeVaried(scene, level) {
  const presets = {
    light:  [80,  0.002],
    medium: [120, 0.005],
    heavy:  [200, 0.010],
  };
  const [dur, intensity] = presets[level] || presets.medium;
  scene.cameras.main.shake(dur, intensity);
}

export function freezeFrame(scene, ms) {
  scene.tweens.pauseAll();
  scene.time.paused = true;
  setTimeout(() => {
    scene.tweens.resumeAll();
    scene.time.paused = false;
  }, ms);
}

export function haptic(pattern) {
  if (!navigator.vibrate) return;
  const presets = {
    tap:     [15],
    success: [10, 30, 10],
    error:   [40, 20, 40],
    combo:   [10, 10, 10, 10, 10],
  };
  navigator.vibrate(presets[pattern] || [15]);
}

// ─── ANIMATED BACKGROUNDS ───────────────────────────────────

const BG_PALETTES = {
  purple: { orbs: [0x7c3aed, 0x9f67ff, 0x6b4fa2], overlay: 0x1a0520 },
  green:  { orbs: [0x059669, 0x34d399, 0x10b981], overlay: 0x051a10 },
  red:    { orbs: [0xdc2626, 0xff6b6b, 0xef4444], overlay: 0x1a0508 },
  gold:   { orbs: [0xd4a44a, 0xffcc66, 0xc4943a], overlay: 0x1a1005 },
};

export function createAnimatedBackground(scene, style) {
  const { width: W, height: H } = scene.scale;
  const pal = BG_PALETTES[style] || BG_PALETTES.gold;

  // Gradient overlay
  const overlay = scene.add.rectangle(W / 2, 0, W, H * 0.5, pal.overlay, 0.3).setOrigin(0.5, 0);
  overlay.setDepth(-10);

  // Bokeh orbs
  const orbs = [];
  const count = Phaser.Math.Between(15, 20);
  for (let i = 0; i < count; i++) {
    const ox = Phaser.Math.Between(10, W - 10);
    const oy = Phaser.Math.Between(0, H);
    const size = Phaser.Math.Between(8, 28);
    const color = Phaser.Math.RND.pick(pal.orbs);
    const alpha = Phaser.Math.FloatBetween(0.04, 0.12);

    const orb = scene.add.circle(ox, oy, size, color, alpha);
    orb.setDepth(-9);
    orbs.push(orb);

    // Drift upward with wobble
    const dur = Phaser.Math.Between(6000, 14000);
    scene.tweens.add({
      targets: orb, y: -size * 2, duration: dur,
      ease: 'Linear', repeat: -1,
      onRepeat: () => { orb.x = Phaser.Math.Between(10, W - 10); orb.y = H + size * 2; },
    });
    // Horizontal wobble
    scene.tweens.add({
      targets: orb, x: ox + Phaser.Math.Between(-20, 20),
      duration: Phaser.Math.Between(3000, 5000),
      ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });
  }

  // Faint horizontal lines (subtle grid)
  for (let ly = 60; ly < H; ly += 80) {
    const line = scene.add.rectangle(W / 2, ly, W, 1, 0xffffff, 0.015);
    line.setDepth(-8);
  }

  scene._bgOrbs = orbs;
  return orbs;
}

export function pulseBackground(scene, intensity = 0.5) {
  if (!scene._bgOrbs) return;
  scene._bgOrbs.forEach(orb => {
    const origAlpha = orb.alpha;
    scene.tweens.add({
      targets: orb, alpha: origAlpha + intensity * 0.15,
      duration: 150, yoyo: true, ease: 'Power2',
    });
  });
}
