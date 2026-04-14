// ─── MINI GAMES (Phaser.js) ─────────────────────────────────
// Three arcade-style cocktail learning games powered by Phaser 3.
// Integrated into the Stirio SPA as a single view with a Phaser canvas.

import { fichas } from './fichas.js';
import { t, getLang } from './lang.js';
import { GameAudio } from './game-audio.js';
import {
  createGlowTexture, createSoftParticle, createSparkTexture,
  particleBurstPro, sparkBurst, fireBurst,
  floatingScoreText, rollingCounter,
  screenShakeVaried, freezeFrame, haptic,
  createAnimatedBackground, pulseBackground,
} from './game-fx.js';

// ─── DATA HELPERS ────────────────────────────────────────────

function stripQty(str) {
  return str.replace(/^\d+(\.\d+)?\s*(ml|cl|oz|dashes?|drops?|barspoon|splash|top)\s*/i, '').trim();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRecipes() {
  return fichas.filter(f => f.ingredients && f.ingredients.length >= 3).map(f => ({
    name: f.name,
    icon: f.icon || '🍸',
    color: f.color || '#E8A952',
    ingredients: f.ingredients.map(ing => {
      const raw = typeof ing === 'object' ? t(ing) : ing;
      return stripQty(raw);
    }),
  }));
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

function getDistractors(recipes, exclude, count) {
  const pool = new Set();
  recipes.forEach(r => {
    if (r.name === exclude.name) return;
    r.ingredients.forEach(i => {
      if (!exclude.ingredients.includes(i)) pool.add(i);
    });
  });
  return pickRandom([...pool], count);
}

// ─── SHARED STYLE CONSTANTS ──────────────────────────────────

const FONT = 'Nunito, sans-serif';
const CLR = {
  bg: 0x0d0508, surface: 0x1a0d12, surface2: 0x261520,
  accent: 0xd4a44a, green: 0x34d399, red: 0xef4444,
  white: 0xffffff, textLight: 0xf5f0eb,
};

function btn(scene, x, y, w, h, label, color, cb) {
  const r = scene.add.rectangle(x, y, w, h, color, 1).setInteractive();
  r.setStrokeStyle(0);
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: '18px', color: '#fff', fontStyle: 'bold',
  }).setOrigin(0.5);
  r.on('pointerdown', cb);
  return { rect: r, text: txt };
}

// ─── INGREDIENT EMOJI DICTIONARY ─────────────────────────────

const INGREDIENT_EMOJI = {
  // Spirits
  'Gin': '🫒', 'Ginebra': '🫒', 'London Dry Gin': '🫒', 'Old Tom Gin': '🫒',
  'Vodka': '🫧', 'Vodka Citron': '🫧',
  'Ron': '🥥', 'Ron blanco': '🥥', 'Ron dorado': '🥥', 'Ron oscuro': '🥥', 'Ron añejo': '🥥',
  'Rum': '🥥', 'White Rum': '🥥', 'Dark Rum': '🥥', 'Overproof Rum': '🥥',
  'Tequila': '🌵', 'Tequila blanco': '🌵', 'Tequila reposado': '🌵',
  'Mezcal': '🔥',
  'Whisky': '🥃', 'Whiskey': '🥃', 'Bourbon': '🥃', 'Rye Whiskey': '🥃', 'Rye whiskey': '🥃',
  'Scotch': '🥃', 'Scotch Whisky': '🥃', 'Islay Scotch': '🥃',
  'Cognac': '🍇', 'Brandy': '🍇', 'Pisco': '🏔️', 'Cachaça': '🌿',
  // Liqueurs & Aperitifs
  'Campari': '🔴', 'Aperol': '🟠',
  'Cointreau': '🍊', 'Triple Sec': '🍊', 'Curaçao': '🍊', 'Grand Marnier': '🍊',
  'Amaretto': '🌰', 'Kahlúa': '☕', 'Licor de café': '☕',
  'Chartreuse': '🌿', 'Chartreuse verde': '🌿', 'Chartreuse amarillo': '🌿',
  'Maraschino': '🍒', 'Marrasquino': '🍒',
  'Absinthe': '💚', 'Absenta': '💚',
  'Crème de Cassis': '🫐', 'Crème de Cacao': '🍫', 'Crème de Menthe': '🌿',
  'Drambuie': '🍯', 'Bénédictine': '🍯', 'Galliano': '🌻',
  'Licor de flor de saúco': '🌸', 'St-Germain': '🌸',
  // Vermouth & Wine
  'Vermut': '🍷', 'Vermouth': '🍷', 'Vermut rojo': '🍷', 'Vermut seco': '🍷',
  'Vermut dulce': '🍷', 'Vermut blanco': '🍷',
  'Champagne': '🥂', 'Prosecco': '🥂', 'Cava': '🥂', 'Vino espumoso': '🥂',
  'Vino tinto': '🍷', 'Vino blanco': '🍷',
  // Bitters
  'Angostura': '💧', 'Bitters': '💧', 'Angostura bitters': '💧',
  'Orange bitters': '💧', 'Peychaud\'s bitters': '💧',
  // Citrus
  'Zumo de limón': '🍋', 'Limón': '🍋', 'Lemon juice': '🍋',
  'Zumo de lima': '🍈', 'Lima': '🍈', 'Lime juice': '🍈',
  'Zumo de naranja': '🍊', 'Naranja': '🍊', 'Orange juice': '🍊',
  'Zumo de pomelo': '🍊', 'Pomelo': '🍊', 'Grapefruit juice': '🍊',
  'Zumo de piña': '🍍', 'Piña': '🍍',
  'Zumo de arándano': '🫐', 'Arándano': '🫐',
  // Sweeteners
  'Jarabe simple': '🍬', 'Jarabe': '🍬', 'Simple syrup': '🍬', 'Almíbar': '🍬',
  'Azúcar': '🍬', 'Sugar': '🍬', 'Azúcar blanco': '🍬',
  'Miel': '🍯', 'Honey': '🍯', 'Jarabe de miel': '🍯',
  'Granadina': '🌹', 'Grenadine': '🌹',
  'Jarabe de agave': '🌵', 'Agave': '🌵',
  // Mixers & Sodas
  'Soda': '🫧', 'Agua con gas': '🫧', 'Club soda': '🫧',
  'Tónica': '🫧', 'Agua tónica': '🫧', 'Tonic water': '🫧',
  'Ginger beer': '🍺', 'Ginger ale': '🍺', 'Cerveza de jengibre': '🍺',
  'Cola': '🥤', 'Coca-Cola': '🥤',
  // Herbs, Fruits & Garnishes
  'Menta': '🌿', 'Hierbabuena': '🌿', 'Mint': '🌿', 'Hojas de menta': '🌿',
  'Albahaca': '🌿', 'Basil': '🌿',
  'Cereza': '🍒', 'Cereza marrasquino': '🍒', 'Cherry': '🍒',
  'Melocotón': '🍑', 'Peach': '🍑', 'Puré de melocotón': '🍑',
  'Frambuesa': '🍓', 'Fresa': '🍓', 'Strawberry': '🍓',
  'Pepino': '🥒', 'Cucumber': '🥒',
  'Jengibre': '🫚', 'Ginger': '🫚',
  'Oliva': '🫒', 'Aceituna': '🫒', 'Olive': '🫒',
  'Coco': '🥥', 'Crema de coco': '🥥', 'Coconut cream': '🥥',
  // Dairy & Egg
  'Crema': '🥛', 'Crema fresca': '🥛', 'Cream': '🥛', 'Crema de leche': '🥛',
  'Clara de huevo': '🥚', 'Egg white': '🥚',
  'Huevo': '🥚',
  // Spices & Others
  'Canela': '🫚', 'Cinnamon': '🫚',
  'Falernum': '🍬', 'Orgeat': '🌰', 'Cherry Heering': '🍒',
  'Fernet Branca': '🌿', 'Fernet': '🌿',
  'Ron Demerara': '🥥', 'Ron dorado': '🥥',
  'Brandy de Albaricoque': '🍑', 'Apricot Brandy': '🍑',
  'Vermut Rojo Dulce': '🍷', 'Vermut rojo dulce': '🍷',
  'Jarabe de Azúcar': '🍬', 'Jarabe simple': '🍬',
  'Whiskey de centeno': '🥃', 'Champán': '🥂',
  'Tabasco': '🌶️', 'Salsa Worcestershire': '🫙',
  'Sal': '🧂', 'Pimienta': '🧂', 'Salt': '🧂',
  'Café': '☕', 'Espresso': '☕', 'Coffee': '☕',
};

function getIngredientEmoji(name) {
  if (!name) return '🧪';
  // Exact match
  if (INGREDIENT_EMOJI[name]) return INGREDIENT_EMOJI[name];
  // Case-insensitive match
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJI)) {
    if (key.toLowerCase() === lower) return emoji;
  }
  // Substring match (check if any key is contained in the name or vice versa)
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJI)) {
    const kl = key.toLowerCase();
    if (lower.includes(kl) || kl.includes(lower)) return emoji;
  }
  return '🧪';
}

// ─── SHARED VISUAL UTILITIES ─────────────────────────────────

function particleBurst(scene, x, y, count, color, opts = {}) {
  const { emoji, spread = 60, duration = 450, minScale = 0, sizeMin = 3, sizeMax = 6 } = opts;
  for (let i = 0; i < count; i++) {
    const size = Phaser.Math.Between(sizeMin, sizeMax);
    const p = scene.add.circle(x, y, size, color, 0.9);
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.3, 0.3);
    const dist = Phaser.Math.Between(spread * 0.4, spread);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0, scale: minScale,
      duration: Phaser.Math.Between(duration * 0.7, duration),
      ease: 'Power2',
      onComplete: () => p.destroy(),
    });
  }
  // Optional emoji particle
  if (emoji) {
    const ep = scene.add.text(x, y, emoji, { fontSize: '24px' }).setOrigin(0.5);
    scene.tweens.add({
      targets: ep, y: y - 50, alpha: 0, scale: 1.5,
      duration: 500, ease: 'Power2',
      onComplete: () => ep.destroy(),
    });
  }
}

function floatingText(scene, x, y, text, color = '#d4a44a', fontSize = '18px') {
  const ft = scene.add.text(x, y, text, {
    fontFamily: FONT, fontSize, color, fontStyle: 'bold',
  }).setOrigin(0.5);
  scene.tweens.add({
    targets: ft, y: y - 60, alpha: 0,
    duration: 700, ease: 'Power2',
    onComplete: () => ft.destroy(),
  });
  return ft;
}

function screenFlash(scene, r = 255, g = 255, b = 255, duration = 150, alpha = 0.3) {
  scene.cameras.main.flash(duration, r, g, b, false, null, null, alpha);
}

// ─── MENU SCENE ──────────────────────────────────────────────

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width: W, height: H } = this.scale;
    this.cameras.main.fadeIn(300);

    // Premium bokeh background
    createAnimatedBackground(this, 'gold');

    // Title glow (behind) — pulsing gold aura
    createGlowTexture(this, '_menuTitleGlow', 80, 0xd4a44a);
    const titleGlowImg = this.add.image(W / 2, 54, '_menuTitleGlow').setAlpha(0.15).setScale(3, 1);
    this.tweens.add({ targets: titleGlowImg, alpha: 0.06, scaleX: 3.3, duration: 1800, yoyo: true, repeat: -1 });

    // Title shadow (depth)
    this.add.text(W / 2 + 1, 45, t('games.menu_title'), {
      fontFamily: FONT, fontSize: '26px', color: '#000000', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setAlpha(0.3);

    // Title
    this.add.text(W / 2, 44, t('games.menu_title'), {
      fontFamily: FONT, fontSize: '26px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    const cards = [
      { key: 'MixologyRushScene', icon: '🍸', name: t('games.mixology_rush'), desc: t('games.mixology_desc'), color: 0x7c3aed, glow: 0x9f67ff },
      { key: 'NinjaShakerScene',  icon: '🔪', name: t('games.ninja_shaker'),  desc: t('games.ninja_desc'),    color: 0x059669, glow: 0x34d399 },
      { key: 'CocktailTinderScene', icon: '💘', name: t('games.cocktail_tinder'), desc: t('games.tinder_desc'), color: 0xdc2626, glow: 0xff6b6b },
    ];

    const cardW = Math.min(W - 40, 340);
    const cardH = 100;
    const gap = 22;
    const startY = 110;

    cards.forEach((c, i) => {
      const cy = startY + i * (cardH + gap) + cardH / 2;

      // Card glow behind (soft aura)
      createGlowTexture(this, `_menuGlow${i}`, 60, c.glow);
      const glowImg = this.add.image(W / 2, cy, `_menuGlow${i}`).setAlpha(0.15).setScale(cardW / 80, cardH / 60);

      // Card background — glassmorphism rounded rect
      const cardGfx = this.add.graphics();
      cardGfx.fillStyle(c.color, 0.75);
      cardGfx.fillRoundedRect(W / 2 - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
      // Glass highlight at top
      cardGfx.fillStyle(0xffffff, 0.08);
      cardGfx.fillRoundedRect(W / 2 - cardW / 2 + 2, cy - cardH / 2 + 2, cardW - 4, cardH * 0.4, { tl: 14, tr: 14, bl: 0, br: 0 });
      // Border
      cardGfx.lineStyle(1.5, 0xffffff, 0.2);
      cardGfx.strokeRoundedRect(W / 2 - cardW / 2, cy - cardH / 2, cardW, cardH, 16);

      // Interactive hit area over card
      const bg = this.add.rectangle(W / 2, cy, cardW, cardH, 0x000000, 0).setInteractive();

      // Icon with floating animation
      const iconTxt = this.add.text(W / 2 - cardW / 2 + 24, cy - 4, c.icon, {
        fontSize: '38px',
      }).setOrigin(0, 0.5);
      this.tweens.add({ targets: iconTxt, y: cy - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      // Name
      const nameTxt = this.add.text(W / 2 - cardW / 2 + 74, cy - 16, c.name, {
        fontFamily: FONT, fontSize: '19px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      // Description
      const descTxt = this.add.text(W / 2 - cardW / 2 + 74, cy + 14, c.desc, {
        fontFamily: FONT, fontSize: '13px', color: '#ddd',
      }).setOrigin(0, 0.5);

      // Entrance animation: slide up from below with elastic bounce
      const elements = [glowImg, cardGfx, bg, iconTxt, nameTxt, descTxt];
      elements.forEach(el => { if (el.y !== undefined) el.y += H; el.alpha = 0; });
      this.tweens.add({
        targets: elements,
        y: `-=${H}`, alpha: 1,
        duration: 600, ease: 'Back.easeOut',
        delay: 100 + i * 180,
      });

      // Press feedback with audio
      bg.on('pointerdown', () => {
        GameAudio.init();
        GameAudio.sfxUIClick();
        haptic('tap');
        this.tweens.add({
          targets: elements, scaleX: 0.96, scaleY: 0.96,
          duration: 80, yoyo: true,
          onComplete: () => {
            this.cameras.main.fadeOut(200, 0, 0, 0);
            this.time.delayedCall(200, () => this.scene.start(c.key));
          },
        });
      });
    });
  }
}

// ─── MIXOLOGY RUSH (Drag & Drop) ─────────────────────────────

class MixologyRushScene extends Phaser.Scene {
  constructor() { super('MixologyRushScene'); }

  create() {
    const { width: W, height: H } = this.scale;
    this.cameras.main.fadeIn(200);

    const recipes = getRecipes();
    this.recipes = recipes;
    this.round = 0;
    this.totalRounds = 5;
    this.score = 0;
    this.correctTotal = 0;
    this.cocktailNames = [];
    this.vignetteRects = [];

    this._startRound();
  }

  _startRound() {
    this.children.removeAll(true);
    const { width: W, height: H } = this.scale;
    this.vignetteRects = [];

    // Premium bokeh background
    createAnimatedBackground(this, 'purple');

    const cocktail = this.recipes[Math.floor(Math.random() * this.recipes.length)];
    this.currentCocktail = cocktail;
    this.cocktailNames.push(cocktail.name);
    this.correctNeeded = cocktail.ingredients.length;
    this.correctCount = 0;
    this.roundCombo = 0;

    // Round indicator — pill shape
    const roundLabel = `${t('games.round')} ${this.round + 1}/${this.totalRounds}`;
    const pillW = roundLabel.length * 8 + 24;
    this.add.graphics().fillStyle(0xffffff, 0.08).fillRoundedRect(W / 2 - pillW / 2, 8, pillW, 24, 12);
    this.add.text(W / 2, 20, roundLabel, {
      fontFamily: FONT, fontSize: '13px', color: '#bbb',
    }).setOrigin(0.5);

    // Cocktail name with glow
    createGlowTexture(this, '_mrNameGlow', 50, 0xd4a44a);
    this.add.image(W / 2, 48, '_mrNameGlow').setAlpha(0.12).setScale(3, 0.8);
    this.add.text(W / 2, 40, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '22px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Score
    this.scoreTxt = this.add.text(W - 16, 12, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    }).setOrigin(1, 0);

    // Combo text (hidden initially)
    this.comboTxt = this.add.text(W / 2, H - 60, '', {
      fontFamily: FONT, fontSize: '18px', color: '#ffaa00', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Timer bar — rounded with highlight
    const timerW = W - 32;
    const timerG = this.add.graphics();
    timerG.fillStyle(0x333333, 0.6);
    timerG.fillRoundedRect(16, 66, timerW, 10, 5);
    this.timerBg = timerG;
    this.timerFill = this.add.graphics();
    this._drawTimerFill(timerW, CLR.accent);
    // Difficulty progression: timer decreases per round
    this.timeLeft = Math.max(18, 30 - this.round * 3);
    this._maxTime = this.timeLeft;
    this.timerEvent = this.time.addEvent({
      delay: 1000, repeat: this.timeLeft - 1,
      callback: () => { this.timeLeft--; this._updateTimer(); },
    });

    // Urgency vignette rects (hidden initially)
    this.vignetteRects = [
      this.add.rectangle(0, H / 2, 30, H, 0xff0000, 0).setOrigin(0, 0.5),
      this.add.rectangle(W, H / 2, 30, H, 0xff0000, 0).setOrigin(1, 0.5),
    ];

    // Shaker zone — premium glow + double ring + orbits
    const shakerY = H - 100;
    // Large pulsing glow aura
    createGlowTexture(this, '_shakerGlow', 80, CLR.accent);
    this.shakerGlowImg = this.add.image(W / 2, shakerY, '_shakerGlow').setAlpha(0.1).setScale(1.8);
    this.tweens.add({ targets: this.shakerGlowImg, scale: 2.1, alpha: 0.04, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Outer ring
    const outerRing = this.add.circle(W / 2, shakerY, 56, 0x000000, 0).setStrokeStyle(1.5, CLR.accent, 0.25);
    this.tweens.add({ targets: outerRing, scale: 1.08, alpha: 0.6, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Inner shaker — gradient-like effect
    const shakerGfx = this.add.graphics();
    shakerGfx.fillStyle(CLR.surface2, 0.9);
    shakerGfx.fillCircle(W / 2, shakerY, 50);
    shakerGfx.fillStyle(0xffffff, 0.04);
    shakerGfx.fillCircle(W / 2 - 8, shakerY - 10, 30);
    this.shaker = this.add.circle(W / 2, shakerY, 50, 0x000000, 0).setStrokeStyle(2.5, CLR.accent, 0.7);
    this._shakerGfx = shakerGfx;
    // Bobbing shaker emoji
    this.shakerEmoji = this.add.text(W / 2, shakerY - 8, '🍸', { fontSize: '40px' }).setOrigin(0.5);
    this.tweens.add({ targets: this.shakerEmoji, y: shakerY - 14, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(W / 2, shakerY + 34, t('games.drag_here'), {
      fontFamily: FONT, fontSize: '12px', color: '#999',
    }).setOrigin(0.5).setAlpha(0.7);

    // Orbit glow particles
    for (let i = 0; i < 6; i++) {
      const orb = this.add.circle(W / 2, shakerY, Phaser.Math.Between(2, 4), CLR.accent, 0.5);
      const orbAngle = (Math.PI * 2 * i) / 6;
      const orbRadius = Phaser.Math.Between(54, 66);
      const orbSpeed = Phaser.Math.Between(2800, 3500);
      this.tweens.add({
        targets: orb, angle: 360,
        duration: orbSpeed, repeat: -1, ease: 'Linear',
        onUpdate: (tw) => {
          const a = orbAngle + (tw.progress * Math.PI * 2);
          orb.x = W / 2 + Math.cos(a) * orbRadius;
          orb.y = shakerY + Math.sin(a) * orbRadius;
        },
      });
    }

    // Ingredient cards — difficulty progression: more distractors per round
    const distractorCount = Math.min(3 + this.round, 6);
    const distractors = getDistractors(this.recipes, cocktail, distractorCount);
    const allIngredients = shuffle([
      ...cocktail.ingredients.map(i => ({ name: i, correct: true })),
      ...distractors.map(i => ({ name: i, correct: false })),
    ]);
    this._createIngredientCards(allIngredients, W, H, shakerY);

    // Drag events — enhanced with scale feedback + trail
    this.input.on('dragstart', (pointer, obj) => {
      haptic('tap');
      obj.setScale(1.05);
      if (obj._label) obj._label.setScale(1.05);
      if (obj._emojiTxt) obj._emojiTxt.setScale(1.05);
    });
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      obj.x = dragX; obj.y = dragY;
      if (obj._label) { obj._label.x = dragX; obj._label.y = dragY; }
      if (obj._emojiTxt) { obj._emojiTxt.x = dragX - obj._emojiOffsetX; obj._emojiTxt.y = dragY; }
      // Glow shaker when card approaches
      if (this.shakerGlowImg) {
        const d = Phaser.Math.Distance.Between(dragX, dragY, this.shaker.x, this.shaker.y);
        this.shakerGlowImg.setAlpha(Math.min(0.3, 0.08 + (1 - Math.min(d, 200) / 200) * 0.25));
      }
    });
    this.input.on('dragend', (pointer, obj) => {
      obj.setScale(1); if (obj._label) obj._label.setScale(1); if (obj._emojiTxt) obj._emojiTxt.setScale(1);
      if (this.shakerGlowImg) this.shakerGlowImg.setAlpha(0.1);
      this._onDrop(obj);
    });
  }

  _createIngredientCards(ingredients, W, H, shakerY) {
    const cardW = Math.min(145, (W - 40) / 2);
    const cardH = 54;
    const cols = 2;
    const startY = 100;
    const gapX = 12;
    const gapY = 10;

    ingredients.forEach((ing, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (W / 2) - ((cols * cardW + (cols - 1) * gapX) / 2) + col * (cardW + gapX) + cardW / 2;
      const y = startY + row * (cardH + gapY) + cardH / 2;

      const emoji = getIngredientEmoji(ing.name);
      const cardColor = ing.correct ? 0x2d1f3d : 0x1f2d2d;
      const strokeColor = ing.correct ? 0x6b4fa2 : 0x3d6b5d;

      // Card — rounded rect with glass highlight
      const cardGfx = this.add.graphics();
      cardGfx.fillStyle(cardColor, 0.92);
      cardGfx.fillRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 12);
      cardGfx.fillStyle(0xffffff, 0.06);
      cardGfx.fillRoundedRect(x - cardW / 2 + 1, y - cardH / 2 + 1, cardW - 2, cardH * 0.45, { tl: 11, tr: 11, bl: 0, br: 0 });
      cardGfx.lineStyle(1.5, strokeColor, 0.5);
      cardGfx.strokeRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 12);

      // Invisible interactive card for drag
      const card = this.add.rectangle(x, y, cardW, cardH, 0x000000, 0)
        .setInteractive({ draggable: true });
      card._correct = ing.correct;
      card._origX = x;
      card._origY = y;
      card._ingName = ing.name;
      card._cardGfx = cardGfx;

      // Emoji badge — small circle behind
      const badge = this.add.circle(x - cardW / 2 + 22, y, 15, strokeColor, 0.3);
      const emojiTxt = this.add.text(x - cardW / 2 + 22, y, emoji, {
        fontSize: '20px',
      }).setOrigin(0.5);
      card._emojiTxt = emojiTxt;
      card._emojiBadge = badge;
      card._emojiOffsetX = cardW / 2 - 22;

      // Ingredient name with shadow
      this.add.text(x + 9, y + 1, ing.name, {
        fontFamily: FONT, fontSize: '11px', color: '#000', wordWrap: { width: cardW - 52 },
      }).setOrigin(0.5).setAlpha(0.3);
      const label = this.add.text(x + 8, y, ing.name, {
        fontFamily: FONT, fontSize: '11px', color: '#eee', wordWrap: { width: cardW - 52 },
      }).setOrigin(0.5);
      card._label = label;

      // Entrance animation — slide from below with stagger
      const els = [cardGfx, card, badge, emojiTxt, label];
      els.forEach(el => { el.y += 80; el.alpha = 0; });
      this.tweens.add({
        targets: els, y: `-=80`, alpha: 1,
        duration: 350, delay: 80 + i * 60, ease: 'Back.easeOut',
      });
    });
  }

  _onDrop(obj) {
    const dist = Phaser.Math.Distance.Between(obj.x, obj.y, this.shaker.x, this.shaker.y);
    if (dist < 70) {
      if (obj._correct) {
        this.correctCount++;
        this.correctTotal++;
        this.roundCombo++;

        // Combo multiplier
        const mult = this.roundCombo >= 4 ? 3 : this.roundCombo >= 3 ? 2 : this.roundCombo >= 2 ? 1.5 : 1;
        const pts = Math.floor((100 + Math.floor(this.timeLeft * 3)) * mult);
        const oldScore = this.score;
        this.score += pts;
        rollingCounter(this, this.scoreTxt, oldScore, this.score);

        // Premium particle burst + floating score
        const emoji = getIngredientEmoji(obj._ingName);
        particleBurstPro(this, this.shaker.x, this.shaker.y, 14, CLR.green, {
          emoji, spread: 60, palette: [0x34d399, 0x6ee7b7, 0xffffff],
        });
        sparkBurst(this, this.shaker.x, this.shaker.y, 6, CLR.accent);
        floatingScoreText(this, this.shaker.x, this.shaker.y - 45, `+${pts}`, { color: '#34d399', fontSize: '17px' });

        // Feedback
        freezeFrame(this, 35);
        screenShakeVaried(this, 'light');
        haptic('success');
        GameAudio.sfxCorrect();

        // Combo display
        if (this.roundCombo >= 3) {
          this.comboTxt.setText(`Combo x${this.roundCombo}!`).setAlpha(1);
          this.comboTxt.setScale(1.4);
          this.tweens.add({ targets: this.comboTxt, scale: 1, duration: 300, ease: 'Back.easeOut' });
          if (this.roundCombo >= 4) {
            fireBurst(this, this.shaker.x, this.shaker.y);
            this.comboTxt.setColor('#ff6b35');
          }
          pulseBackground(this);
          GameAudio.sfxCombo(this.roundCombo);
        }

        // Destroy card elements
        const destroyEls = [obj, obj._label, obj._emojiTxt, obj._cardGfx, obj._emojiBadge].filter(Boolean);
        this.tweens.add({
          targets: destroyEls,
          scale: 0, alpha: 0, duration: 200,
          onComplete: () => destroyEls.forEach(el => el.destroy()),
        });
        this._flashShaker(CLR.green);

        // Last ingredient — big celebration
        if (this.correctCount >= this.correctNeeded) {
          fireBurst(this, this.shaker.x, this.shaker.y - 30);
          GameAudio.sfxVictory();
          this._endRound(true);
        }
      } else {
        this.roundCombo = 0;
        this.comboTxt.setText('').setAlpha(0);
        this._flashShaker(CLR.red);
        screenShakeVaried(this, 'heavy');
        screenFlash(this, 255, 0, 0, 120, 0.2);
        haptic('error');
        GameAudio.sfxWrong();
        // Red X mark
        const xMark = this.add.text(obj.x, obj.y, '✕', {
          fontSize: '40px', color: '#ef4444', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.tweens.add({ targets: xMark, scale: 2, alpha: 0, duration: 500, onComplete: () => xMark.destroy() });
        this._bounceBack(obj);
      }
    } else {
      this._bounceBack(obj);
    }
  }

  _bounceBack(obj) {
    const targets = [obj, obj._label, obj._emojiTxt, obj._cardGfx, obj._emojiBadge].filter(Boolean);
    targets.forEach(t => {
      const isEmoji = t === obj._emojiTxt;
      const isBadge = t === obj._emojiBadge;
      const targetX = isEmoji || isBadge ? obj._origX - obj._emojiOffsetX : obj._origX;
      this.tweens.add({ targets: t, x: targetX, y: obj._origY, duration: 300, ease: 'Back.easeOut' });
    });
  }

  _flashShaker(color) {
    this.shaker.setFillStyle(color, 0.7);
    this.time.delayedCall(200, () => this.shaker.setFillStyle(CLR.surface2, 0.9));
  }

  _drawTimerFill(w, color) {
    this.timerFill.clear();
    this.timerFill.fillStyle(color, 0.9);
    this.timerFill.fillRoundedRect(16, 66, w, 10, 5);
    // Highlight strip at top
    this.timerFill.fillStyle(0xffffff, 0.15);
    this.timerFill.fillRoundedRect(16, 66, w, 4, { tl: 5, tr: 5, bl: 0, br: 0 });
  }

  _updateTimer() {
    const { width: W } = this.scale;
    const timerW = W - 32;
    const pct = this.timeLeft / this._maxTime;
    const fillW = timerW * pct;
    const color = this.timeLeft <= 5 ? 0xff4444 : this.timeLeft <= 10 ? 0xef4444 : CLR.accent;
    this._drawTimerFill(fillW, color);

    if (this.timeLeft <= 10) {
      // Pulsing vignette urgency
      const vigAlpha = this.timeLeft <= 5 ? 0.15 : 0.08;
      this.vignetteRects.forEach(v => {
        this.tweens.add({ targets: v, alpha: vigAlpha, duration: 400, yoyo: true });
      });
      // Timer bar pulses
      if (this.timeLeft <= 5) {
        this.tweens.add({ targets: this.timerFill, scaleY: 1.3, duration: 200, yoyo: true });
        if (this.timeLeft % 2 === 0) GameAudio.sfxTimerWarn();
      }
    }
    if (this.timeLeft <= 0) this._endRound(false);
  }

  _endRound(completed) {
    if (this.timerEvent) this.timerEvent.remove();
    this.round++;

    // Round complete banner
    if (completed) {
      const { width: W, height: H } = this.scale;
      const banner = this.add.graphics();
      banner.fillStyle(0x7c3aed, 0.85);
      banner.fillRoundedRect(W / 2 - 130, H / 2 - 30, 260, 60, 16);
      const bannerTxt = this.add.text(W / 2, H / 2, `${this.currentCocktail.icon} ${t('games.round')} ${this.round}/${this.totalRounds}`, {
        fontFamily: FONT, fontSize: '18px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);
      // Perfect round bonus
      if (this.roundCombo >= this.correctNeeded) {
        const bonusTxt = this.add.text(W / 2, H / 2 + 22, '+200 Perfect!', {
          fontFamily: FONT, fontSize: '14px', color: '#ffdd57', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.score += 200;
        fireBurst(this, W / 2, H / 2);
      }
      // Animate banner in/out
      banner.y -= H; bannerTxt.y -= H;
      this.tweens.add({ targets: [banner, bannerTxt], y: `+=${H}`, duration: 300, ease: 'Back.easeOut' });
    }

    if (this.round < this.totalRounds) {
      this.time.delayedCall(completed ? 1200 : 600, () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
          this.cameras.main.fadeIn(200);
          this._startRound();
        });
      });
    } else {
      this.time.delayedCall(completed ? 1200 : 400, () => {
        this.scene.start('GameResultScene', {
          mode: 'mixology-rush',
          score: this.score,
          correct: this.correctTotal,
          total: this.totalRounds * 3,
          cocktailNames: this.cocktailNames,
        });
      });
    }
  }
}

// ─── NINJA SHAKER (Swipe / Slice) ────────────────────────────

class NinjaShakerScene extends Phaser.Scene {
  constructor() { super('NinjaShakerScene'); }

  create() {
    const { width: W, height: H } = this.scale;
    this.cameras.main.fadeIn(200);

    // Premium bokeh background
    createAnimatedBackground(this, 'green');

    const recipes = getRecipes();
    const cocktail = recipes[Math.floor(Math.random() * recipes.length)];
    this.cocktail = cocktail;
    this.correctSet = new Set(cocktail.ingredients);

    const distractors = getDistractors(recipes, cocktail, 15);
    this.pool = shuffle([
      ...cocktail.ingredients.map(n => ({ name: n, correct: true })),
      ...cocktail.ingredients.map(n => ({ name: n, correct: true })),
      ...distractors.map(n => ({ name: n, correct: false })),
    ]);
    this.poolIdx = 0;

    this.score = 0;
    this.correct = 0;
    this.combo = 0;
    this.lives = 3;
    this.totalSpawned = 0;
    this.maxSpawn = 35;
    this.items = [];
    this.ended = false;
    this._fireGlows = [];

    // Header with glow
    createGlowTexture(this, '_nsNameGlow', 50, 0xd4a44a);
    this.add.image(W / 2, 22, '_nsNameGlow').setAlpha(0.1).setScale(3, 0.6);
    this.add.text(W / 2, 12, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '20px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.scoreTxt = this.add.text(16, 12, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    });

    // Lives — styled hearts
    this.livesTxt = this.add.text(W - 16, 12, '❤️'.repeat(this.lives), {
      fontSize: '16px',
    }).setOrigin(1, 0);

    this.comboTxt = this.add.text(W / 2, 42, '', {
      fontFamily: FONT, fontSize: '18px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Progress bar at bottom
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0xffffff, 0.05);
    this.progressBg.fillRoundedRect(16, H - 12, W - 32, 4, 2);
    this.progressFill = this.add.graphics();

    // Dynamic spawn: start slow, get faster
    this._scheduleSpawn();

    this.input.on('pointerdown', (pointer) => this._onTap(pointer));
  }

  _scheduleSpawn() {
    if (this.ended || this.totalSpawned >= this.maxSpawn) return;
    // Difficulty: spawn rate increases over time
    let delay;
    if (this.totalSpawned < 8) delay = 1200;
    else if (this.totalSpawned < 15) delay = 1000;
    else if (this.totalSpawned < 25) delay = 800;
    else delay = 650;

    this.time.delayedCall(delay, () => {
      this._spawnItem();
      this._scheduleSpawn();
    });
  }

  _spawnItem() {
    if (this.ended || this.totalSpawned >= this.maxSpawn) return;
    const { width: W, height: H } = this.scale;

    const ing = this.pool[this.poolIdx % this.pool.length];
    this.poolIdx++;
    this.totalSpawned++;

    // Update progress bar
    this.progressFill.clear();
    this.progressFill.fillStyle(0x34d399, 0.5);
    this.progressFill.fillRoundedRect(16, H - 12, (W - 32) * (this.totalSpawned / this.maxSpawn), 4, 2);

    const emoji = getIngredientEmoji(ing.name);
    const x = Phaser.Math.Between(50, W - 50);
    const startY = H + 40;
    const peakY = Phaser.Math.Between(80, H * 0.35);
    const isLast5 = this.totalSpawned > this.maxSpawn - 5;

    // Orb — gradient effect via graphics
    const orbColor = ing.correct ? 0x2a1845 : 0x1a2830;
    const strokeColor = ing.correct ? 0x6b4fa2 : 0x4a6b7a;
    const orbGfx = this.add.graphics();
    orbGfx.fillStyle(orbColor, 0.9);
    orbGfx.fillCircle(0, 0, 32);
    // Glass highlight
    orbGfx.fillStyle(0xffffff, 0.06);
    orbGfx.fillCircle(-6, -8, 18);
    orbGfx.lineStyle(2, strokeColor, isLast5 ? 0.8 : 0.5);
    orbGfx.strokeCircle(0, 0, 32);
    orbGfx.setPosition(x, startY);

    // Glow behind orb (brighter for last 5 items)
    const glowAlpha = isLast5 ? 0.15 : 0.08;
    createGlowTexture(this, '_orbGlow', 40, strokeColor);
    const orbGlowImg = this.add.image(x, startY, '_orbGlow').setAlpha(glowAlpha).setScale(1.2);

    // Emoji
    const emojiTxt = this.add.text(x, startY - 4, emoji, { fontSize: '26px' }).setOrigin(0.5);

    // Name label
    const label = this.add.text(x, startY + 18, ing.name, {
      fontFamily: FONT, fontSize: '9px', color: '#bbb',
      wordWrap: { width: 62 }, align: 'center',
    }).setOrigin(0.5, 0);

    const circle = this.add.circle(x, startY, 32, 0x000000, 0); // invisible hitbox
    const item = { circle, orbGfx, orbGlowImg, emojiTxt, label, correct: ing.correct, alive: true, ingName: ing.name };
    this.items.push(item);

    // Glow trail effect
    const trailTimer = this.time.addEvent({
      delay: 70, loop: true,
      callback: () => {
        if (!item.alive) { trailTimer.remove(); return; }
        const trail = this.add.circle(orbGfx.x, orbGfx.y, Phaser.Math.Between(3, 6), strokeColor, 0.2);
        trail.setDepth(-1);
        this.tweens.add({ targets: trail, alpha: 0, scale: 0, duration: 350, onComplete: () => trail.destroy() });
      },
    });
    item._trailTimer = trailTimer;

    // Difficulty: arc time decreases over time
    const baseDur = Math.max(1400, 2400 - Math.floor(this.totalSpawned / 5) * 100);
    const dur = Phaser.Math.Between(baseDur - 200, baseDur + 200);
    const endX = x + Phaser.Math.Between(-40, 40);
    const allTargets = [circle, orbGfx, orbGlowImg, emojiTxt, label];

    const syncPositions = () => {
      emojiTxt.y = orbGfx.y - 4; label.y = orbGfx.y + 18;
      emojiTxt.x = orbGfx.x; label.x = orbGfx.x;
      circle.x = orbGfx.x; circle.y = orbGfx.y;
      orbGlowImg.x = orbGfx.x; orbGlowImg.y = orbGfx.y;
    };

    this.tweens.add({
      targets: allTargets, y: peakY, x: endX,
      duration: dur * 0.45, ease: 'Sine.easeOut',
      onUpdate: syncPositions,
      onComplete: () => {
        this.tweens.add({
          targets: allTargets, y: H + 60,
          duration: dur * 0.55, ease: 'Sine.easeIn',
          onUpdate: syncPositions,
          onComplete: () => {
            if (item.alive) {
              item.alive = false;
              if (item._trailTimer) item._trailTimer.remove();
              // Miss penalty for correct items
              if (item.correct) {
                this.score = Math.max(0, this.score - 20);
                this.scoreTxt.setText(`${this.score} pts`);
                const ghost = this.add.text(orbGfx.x, H - 30, ing.name, {
                  fontFamily: FONT, fontSize: '10px', color: '#666',
                }).setOrigin(0.5).setAlpha(0.6);
                this.tweens.add({ targets: ghost, alpha: 0, y: H - 50, duration: 800, onComplete: () => ghost.destroy() });
              }
              [circle, orbGfx, orbGlowImg, emojiTxt, label].forEach(el => el.destroy());
              this._checkEnd();
            }
          },
        });
      },
    });
  }

  _onTap(pointer) {
    if (this.ended) return;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.alive) continue;
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, item.circle.x, item.circle.y);
      if (dist < 44) {
        item.alive = false;
        if (item._trailTimer) item._trailTimer.remove();
        const ix = item.circle.x, iy = item.circle.y;

        if (item.correct) {
          this.correct++;
          this.combo++;
          const bonus = Math.min(this.combo, 5) * 20;
          const pts = 100 + bonus;
          const oldScore = this.score;
          this.score += pts;
          rollingCounter(this, this.scoreTxt, oldScore, this.score);

          // Premium slice effect
          this._sliceEffect(ix, iy, CLR.green, getIngredientEmoji(item.ingName));
          floatingScoreText(this, ix, iy - 35, `+${pts}`, { color: '#34d399', fontSize: '16px' });
          freezeFrame(this, 30);
          screenShakeVaried(this, 'light');
          haptic('tap');
          GameAudio.sfxSlice();

          // Combo escalation
          if (this.combo >= 3) {
            this.comboTxt.setText(`${t('games.combo')} x${this.combo}!`);
            this.comboTxt.setScale(1.5);
            this.tweens.add({ targets: this.comboTxt, scale: 1, duration: 300, ease: 'Back.easeOut' });
            GameAudio.sfxCombo(this.combo);
            pulseBackground(this);

            if (this.combo >= 8) {
              // Legendary level: fire burst every tap
              fireBurst(this, ix, iy);
              this.comboTxt.setColor('#ff4444');
            } else if (this.combo >= 5) {
              // Fire level: orange glow at edges
              this.comboTxt.setColor('#ff6b35');
              this._showFireEdges();
            } else {
              this.comboTxt.setColor('#ffaa00');
            }
          }
        } else {
          this.combo = 0;
          this.lives--;
          this.livesTxt.setText('❤️'.repeat(Math.max(0, this.lives)));
          this.comboTxt.setText('');
          this.comboTxt.setColor('#d4a44a');
          this._hideFireEdges();

          // Premium wrong effect
          this._sliceEffect(ix, iy, CLR.red);
          screenShakeVaried(this, 'heavy');
          screenFlash(this, 255, 0, 0, 200, 0.3);
          haptic('error');
          GameAudio.sfxWrong();

          const xMark = this.add.text(ix, iy, '✕', {
            fontSize: '48px', color: '#ef4444', fontStyle: 'bold',
          }).setOrigin(0.5);
          this.tweens.add({ targets: xMark, scale: 2, alpha: 0, duration: 500, onComplete: () => xMark.destroy() });

          if (this.lives <= 0) {
            this._destroyItem(item);
            GameAudio.sfxGameOver();
            this._endGame(); return;
          }
        }
        this._destroyItem(item);
        this._checkEnd();
        return;
      }
    }
  }

  _destroyItem(item) {
    [item.circle, item.orbGfx, item.orbGlowImg, item.emojiTxt, item.label].forEach(el => { if (el) el.destroy(); });
  }

  _showFireEdges() {
    if (this._fireGlows.length) return;
    const { width: W, height: H } = this.scale;
    const left = this.add.rectangle(0, H / 2, 25, H, 0xff6b35, 0).setOrigin(0, 0.5);
    const right = this.add.rectangle(W, H / 2, 25, H, 0xff6b35, 0).setOrigin(1, 0.5);
    this._fireGlows = [left, right];
    this.tweens.add({ targets: [left, right], alpha: 0.12, duration: 300, yoyo: true, repeat: -1 });
  }

  _hideFireEdges() {
    this._fireGlows.forEach(g => g.destroy());
    this._fireGlows = [];
  }

  _sliceEffect(x, y, color, emoji) {
    // Tapered slash line with glow
    const angle = Phaser.Math.Between(-30, 30);
    const slashGlow = this.add.rectangle(x, y, 70, 6, color, 0.3).setAngle(angle);
    const slash = this.add.rectangle(x, y, 65, 3, 0xffffff, 0.9).setAngle(angle);
    this.tweens.add({ targets: [slash, slashGlow], alpha: 0, scaleX: 1.6, duration: 250, onComplete: () => { slash.destroy(); slashGlow.destroy(); } });

    // Orb shatter fragments
    for (let i = 0; i < 5; i++) {
      const frag = this.add.circle(x, y, Phaser.Math.Between(4, 10), color, 0.7);
      const a = (Math.PI * 2 * i) / 5 + Phaser.Math.FloatBetween(-0.3, 0.3);
      this.tweens.add({
        targets: frag,
        x: x + Math.cos(a) * Phaser.Math.Between(25, 55),
        y: y + Math.sin(a) * Phaser.Math.Between(25, 55),
        alpha: 0, scale: 0, duration: 400, ease: 'Power2',
        onComplete: () => frag.destroy(),
      });
    }

    // Particle burst
    particleBurstPro(this, x, y, 10, color, { emoji, spread: 50, duration: 380 });
  }

  _checkEnd() {
    if (this.totalSpawned >= this.maxSpawn && this.items.every(i => !i.alive)) {
      this._endGame();
    }
  }

  _endGame() {
    if (this.ended) return;
    this.ended = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.time.delayedCall(500, () => {
      this.scene.start('GameResultScene', {
        mode: 'ninja-shaker',
        score: this.score,
        correct: this.correct,
        total: this.maxSpawn,
        cocktailNames: [this.cocktail.name],
      });
    });
  }
}

// ─── COCKTAIL TINDER (Swipe Binary) ─────────────────────────

class CocktailTinderScene extends Phaser.Scene {
  constructor() { super('CocktailTinderScene'); }

  create() {
    const { width: W, height: H } = this.scale;
    this.cameras.main.fadeIn(200);

    // Premium bokeh background
    createAnimatedBackground(this, 'red');

    const recipes = getRecipes();
    const cocktail = recipes[Math.floor(Math.random() * recipes.length)];
    this.cocktail = cocktail;

    const correctCards = cocktail.ingredients.map(i => ({ name: i, belongs: true }));
    const wrongPool = getDistractors(recipes, cocktail, 20);
    const wrongCards = wrongPool.slice(0, 10).map(i => ({ name: i, belongs: false }));
    this.deck = shuffle([...correctCards, ...wrongCards]);
    this.deckIdx = 0;

    this.score = 0;
    this.correct = 0;
    this.streak = 0;
    this.total = this.deck.length;
    this.ended = false;
    this._thresholdCrossed = false;

    // Header with glow
    createGlowTexture(this, '_ctNameGlow', 50, 0xd4a44a);
    this.add.image(W / 2, 26, '_ctNameGlow').setAlpha(0.1).setScale(3, 0.6);
    this.add.text(W / 2, 16, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '20px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Directional glow rects
    this.glowLeft = this.add.rectangle(0, H / 2, 50, H, 0xff0000, 0).setOrigin(0, 0.5);
    this.glowRight = this.add.rectangle(W, H / 2, 50, H, 0x00ff88, 0).setOrigin(1, 0.5);

    // Side hints with subtle pulse
    const hintL = this.add.text(18, H / 2, t('games.swipe_left'), {
      fontFamily: FONT, fontSize: '11px', color: '#ef4444',
    }).setOrigin(0, 0.5).setAngle(-90).setAlpha(0.5);
    const hintR = this.add.text(W - 18, H / 2, t('games.swipe_right'), {
      fontFamily: FONT, fontSize: '11px', color: '#34d399',
    }).setOrigin(1, 0.5).setAngle(90).setAlpha(0.5);
    this.tweens.add({ targets: [hintL, hintR], alpha: 0.3, duration: 1500, yoyo: true, repeat: -1 });

    this.scoreTxt = this.add.text(W / 2, 46, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    }).setOrigin(0.5, 0);

    // Progress bar
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0xffffff, 0.05);
    this.progressBg.fillRoundedRect(16, H - 18, W - 32, 4, 2);
    this.progressFill = this.add.graphics();

    this.progressTxt = this.add.text(W / 2, H - 30, `1/${this.total}`, {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5);

    this.streakTxt = this.add.text(W / 2, 66, '', {
      fontFamily: FONT, fontSize: '18px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this._showCard();
  }

  _getThreshold() {
    // Difficulty progression: threshold shrinks as you progress
    if (this.deckIdx < 5) return this.scale.width * 0.25;
    if (this.deckIdx < 10) return this.scale.width * 0.2;
    if (this.deckIdx < 15) return this.scale.width * 0.15;
    return this.scale.width * 0.12;
  }

  _showCard() {
    if (this.deckIdx >= this.deck.length) { this._endGame(); return; }

    const { width: W, height: H } = this.scale;
    const card = this.deck[this.deckIdx];
    const emoji = getIngredientEmoji(card.name);
    const cardW = Math.min(W - 60, 270);
    const cardH = 210;
    const cx = W / 2, cy = H / 2 + 10;
    this._thresholdCrossed = false;

    // Card shadow
    this.cardShadow = this.add.rectangle(cx + 3, cy + 5, cardW, cardH, 0x000000, 0.2);

    // Card — glassmorphism rounded rect
    this.cardGfx = this.add.graphics();
    this.cardGfx.fillStyle(CLR.surface2, 0.92);
    this.cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
    // Glass highlight
    this.cardGfx.fillStyle(0xffffff, 0.06);
    this.cardGfx.fillRoundedRect(cx - cardW / 2 + 2, cy - cardH / 2 + 2, cardW - 4, cardH * 0.35, { tl: 14, tr: 14, bl: 0, br: 0 });
    this.cardGfx.lineStyle(2, 0x555555, 0.4);
    this.cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);

    // Interactive hitbox
    this.cardBg = this.add.rectangle(cx, cy, cardW, cardH, 0x000000, 0)
      .setInteractive({ draggable: true });
    this.cardBg._belongs = card.belongs;
    this.cardBg._origX = cx;
    this.cardBg._ingName = card.name;

    // Emoji emblem (circle behind)
    this.cardEmblem = this.add.circle(cx, cy - 35, 30, 0xffffff, 0.06);
    this.cardEmoji = this.add.text(cx, cy - 35, emoji, { fontSize: '48px' }).setOrigin(0.5);

    // Ingredient name with shadow
    this.add.text(cx + 1, cy + 21, card.name, {
      fontFamily: FONT, fontSize: '19px', color: '#000', fontStyle: 'bold',
      wordWrap: { width: cardW - 24 }, align: 'center',
    }).setOrigin(0.5).setAlpha(0.3);
    this.cardLabel = this.add.text(cx, cy + 20, card.name, {
      fontFamily: FONT, fontSize: '19px', color: '#fff', fontStyle: 'bold',
      wordWrap: { width: cardW - 24 }, align: 'center',
    }).setOrigin(0.5);

    // Stamp indicator (hidden initially)
    this.cardStamp = this.add.text(cx, cy + 70, '', {
      fontFamily: FONT, fontSize: '20px', color: '#999', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Shine animation
    const shine = this.add.rectangle(cx - cardW, cy, 10, cardH * 1.4, 0xffffff, 0.1).setAngle(20);
    this.tweens.add({ targets: shine, x: cx + cardW, duration: 500, ease: 'Power2', onComplete: () => shine.destroy() });

    // Card entrance from bottom
    const allCardEls = this._getAllCardEls();
    allCardEls.forEach(el => { el.y += 60; el.alpha = el === this.cardBg ? 0 : 0.5; el.setScale(0.8); });
    this.tweens.add({ targets: allCardEls, y: `-=60`, scale: 1, alpha: (_, __, ___, i) => i === 0 ? 0 : 1, duration: 250, ease: 'Back.easeOut' });
    GameAudio.sfxUIClick();

    // Update progress
    this.progressTxt.setText(`${this.deckIdx + 1}/${this.total}`);
    this.progressFill.clear();
    this.progressFill.fillStyle(0xef4444, 0.4);
    const { height: pH } = this.scale;
    this.progressFill.fillRoundedRect(16, pH - 18, (this.scale.width - 32) * (this.deckIdx / this.total), 4, 2);

    this.input.on('drag', this._onDrag, this);
    this.input.on('dragend', this._onDragEnd, this);
  }

  _getAllCardEls() {
    return [this.cardBg, this.cardGfx, this.cardShadow, this.cardEmblem, this.cardEmoji, this.cardLabel, this.cardStamp].filter(Boolean);
  }

  _onDrag(pointer, obj, dragX) {
    if (obj !== this.cardBg) return;
    const diff = dragX - obj._origX;
    const rot = diff * 0.002;

    // Move all card elements together
    const allEls = this._getAllCardEls();
    allEls.forEach(el => { el.x = dragX + (el === this.cardShadow ? 3 : 0); el.rotation = rot; });

    // Directional glow + stamps
    const { width: W } = this.scale;
    const absDiff = Math.abs(diff);
    const glowAlpha = Math.min(absDiff / (W * 0.3), 0.3);
    const threshold = this._getThreshold();

    if (diff > 40) {
      this.glowRight.setAlpha(glowAlpha);
      this.glowLeft.setAlpha(0);
      if (absDiff > threshold) {
        this.cardStamp.setText('YES').setColor('#34d399').setAlpha(0.8).setAngle(15);
        if (!this._thresholdCrossed) { this._thresholdCrossed = true; haptic('tap'); }
      } else {
        this.cardStamp.setAlpha(0);
      }
    } else if (diff < -40) {
      this.glowLeft.setAlpha(glowAlpha);
      this.glowRight.setAlpha(0);
      if (absDiff > threshold) {
        this.cardStamp.setText('NOPE').setColor('#ef4444').setAlpha(0.8).setAngle(-15);
        if (!this._thresholdCrossed) { this._thresholdCrossed = true; haptic('tap'); }
      } else {
        this.cardStamp.setAlpha(0);
      }
    } else {
      this.glowLeft.setAlpha(0);
      this.glowRight.setAlpha(0);
      this.cardStamp.setAlpha(0);
      this._thresholdCrossed = false;
    }
  }

  _onDragEnd(pointer, obj) {
    if (obj !== this.cardBg) return;
    const { width: W } = this.scale;
    const diff = obj.x - obj._origX;
    const threshold = this._getThreshold();

    this.glowLeft.setAlpha(0);
    this.glowRight.setAlpha(0);

    if (Math.abs(diff) > threshold) {
      const swipedRight = diff > 0;
      const isCorrect = swipedRight === obj._belongs;

      if (isCorrect) {
        this.correct++;
        this.streak++;
        const bonus = Math.min(this.streak, 5) * 20;
        const pts = 100 + bonus;
        const oldScore = this.score;
        this.score += pts;
        rollingCounter(this, this.scoreTxt, oldScore, this.score);
        floatingScoreText(this, W / 2, obj.y - 60, `+${pts}`, { color: '#34d399' });
        haptic('success');
        GameAudio.sfxCorrect();

        // Streak escalation
        if (this.streak >= 10) {
          this.streakTxt.setText(`LEGENDARY x${this.streak}`).setColor('#ffdd57');
          fireBurst(this, W / 2, this.scale.height / 2);
        } else if (this.streak >= 8) {
          this.streakTxt.setText(`ON FIRE! x${this.streak}`).setColor('#ff4444');
          fireBurst(this, W / 2, this.scale.height / 2);
          pulseBackground(this, 0.8);
        } else if (this.streak >= 5) {
          this.streakTxt.setText(`🔥 ${t('games.streak')} x${this.streak}`).setColor('#ff6b35');
          pulseBackground(this);
        } else if (this.streak >= 3) {
          this.streakTxt.setText(`🔥 ${t('games.streak')} x${this.streak}`).setColor('#d4a44a');
        }
        if (this.streak >= 3) {
          this.streakTxt.setScale(1.4);
          this.tweens.add({ targets: this.streakTxt, scale: 1, duration: 300, ease: 'Back.easeOut' });
          GameAudio.sfxCombo(this.streak);
        }
      } else {
        this.streak = 0;
        this.streakTxt.setText('');
        screenShakeVaried(this, 'medium');
        screenFlash(this, 255, 0, 0, 150, 0.2);
        haptic('error');
        GameAudio.sfxWrong();
      }

      // Card flies off with arc
      const flyX = diff > 0 ? W + 200 : -200;
      const allEls = this._getAllCardEls();
      this.tweens.add({
        targets: allEls,
        x: flyX, y: `-=30`, alpha: 0, duration: 250, ease: 'Power2',
        onComplete: () => {
          this._showFeedback(isCorrect);
          allEls.forEach(el => el.destroy());
          this.input.off('drag', this._onDrag, this);
          this.input.off('dragend', this._onDragEnd, this);
          this.deckIdx++;
          this.time.delayedCall(300, () => this._showCard());
        },
      });
    } else {
      // Snap back
      const allEls = this._getAllCardEls();
      this.tweens.add({ targets: allEls, x: obj._origX, rotation: 0, duration: 200, ease: 'Back' });
      this._thresholdCrossed = false;
    }
  }

  _showFeedback(correct) {
    const { width: W, height: H } = this.scale;
    const color = correct ? CLR.green : CLR.red;
    particleBurstPro(this, W / 2, H / 2, 10, color, { spread: 50, duration: 400 });

    const fb = this.add.text(W / 2, H / 2, correct ? '✓' : '✗', {
      fontSize: '64px', color: correct ? '#34d399' : '#ef4444',
    }).setOrigin(0.5);
    this.tweens.add({ targets: fb, alpha: 0, scale: 2.2, duration: 400, onComplete: () => fb.destroy() });
  }

  _endGame() {
    if (this.ended) return;
    this.ended = true;
    this.scene.start('GameResultScene', {
      mode: 'cocktail-tinder',
      score: this.score,
      correct: this.correct,
      total: this.total,
      cocktailNames: [this.cocktail.name],
    });
  }
}

// ─── GAME RESULT SCENE ──────────────────────────────────────

class GameResultScene extends Phaser.Scene {
  constructor() { super('GameResultScene'); }

  create(data) {
    const { width: W, height: H } = this.scale;
    this.cameras.main.fadeIn(200);

    const pct = data.total > 0 ? data.correct / data.total : 0;
    const emojiChar = pct >= 0.8 ? '🏆' : pct >= 0.5 ? '👏' : '💪';
    const title = pct >= 0.8 ? t('games.great') : pct >= 0.5 ? t('games.good') : t('games.try_again');

    // Background mood per tier
    const bgStyle = pct >= 0.8 ? 'gold' : pct >= 0.5 ? 'purple' : 'red';
    createAnimatedBackground(this, bgStyle);

    // Enhanced confetti
    if (pct >= 0.5) {
      const confettiColors = [0xd4a44a, 0x34d399, 0x7c3aed, 0xef4444, 0x3498db, 0xff6b6b];
      // For 80%+: golden explosion from center first
      if (pct >= 0.8) {
        fireBurst(this, W / 2, H * 0.3);
        sparkBurst(this, W / 2, H * 0.3, 10, 0xd4a44a);
        GameAudio.sfxVictory();
      }
      // Confetti rain
      const count = pct >= 0.8 ? 40 : 18;
      for (let i = 0; i < count; i++) {
        const cx = Phaser.Math.Between(10, W - 10);
        const shapes = ['rect', 'circle'];
        const shape = Phaser.Math.RND.pick(shapes);
        const color = Phaser.Math.RND.pick(confettiColors);
        let confetti;
        if (shape === 'circle') {
          confetti = this.add.circle(cx, -10, Phaser.Math.Between(3, 6), color, 0.8);
        } else {
          confetti = this.add.rectangle(cx, -10, Phaser.Math.Between(4, 8), Phaser.Math.Between(8, 14), color, 0.8);
        }
        confetti.setAngle(Phaser.Math.Between(0, 360));
        // Flutter with oscillating x
        const xDrift = Phaser.Math.Between(-80, 80);
        this.tweens.add({
          targets: confetti,
          y: H + 20, x: cx + xDrift,
          angle: Phaser.Math.Between(180, 720),
          duration: Phaser.Math.Between(2000, 4500),
          delay: Phaser.Math.Between(pct >= 0.8 ? 300 : 0, 1200),
          ease: 'Sine.easeIn',
          onComplete: () => confetti.destroy(),
        });
      }
    } else {
      // Gentle encouragement particles for low scores
      for (let i = 0; i < 8; i++) {
        const px = Phaser.Math.Between(30, W - 30);
        const p = this.add.circle(px, H + 10, Phaser.Math.Between(4, 8), 0xff8c42, 0.3);
        this.tweens.add({
          targets: p, y: Phaser.Math.Between(H * 0.3, H * 0.7), alpha: 0,
          duration: Phaser.Math.Between(2000, 3500), delay: i * 200,
          onComplete: () => p.destroy(),
        });
      }
    }

    // Emoji — elastic bounce in
    const emojiTxt = this.add.text(W / 2, -60, emojiChar, { fontSize: '72px' }).setOrigin(0.5).setScale(3);
    this.tweens.add({ targets: emojiTxt, y: H * 0.11, scale: 1, duration: 700, ease: 'Elastic.easeOut' });

    // Title with glow
    createGlowTexture(this, '_resGlow', 60, 0xd4a44a);
    this.add.image(W / 2, H * 0.22, '_resGlow').setAlpha(0.1).setScale(2.5, 0.7);
    const titleTxt = this.add.text(W / 2, H * 0.22, title, {
      fontFamily: FONT, fontSize: '26px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: titleTxt, alpha: 1, duration: 300, delay: 250 });
    this.tweens.add({ targets: titleTxt, scale: 1.03, duration: 1200, yoyo: true, repeat: -1 });

    // Score — rolling counter
    const scoreTxt = this.add.text(W / 2, H * 0.32 + 30, '0', {
      fontFamily: FONT, fontSize: '32px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    const scoreLbl = this.add.text(W / 2, H * 0.32 + 58, t('games.score'), {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: [scoreTxt, scoreLbl], y: `-=30`, alpha: 1, duration: 350, delay: 400,
      onComplete: () => {
        // Animate score count-up
        const counter = { val: 0 };
        this.tweens.add({
          targets: counter, val: data.score, duration: 1200, ease: 'Power2',
          onUpdate: () => scoreTxt.setText(`${Math.round(counter.val)}`),
          onComplete: () => {
            scoreTxt.setText(`${data.score}`);
            // Flash on completion
            this.tweens.add({ targets: scoreTxt, scale: 1.15, duration: 100, yoyo: true });
            // Check high score
            const hs = _getHighScore(data.mode);
            if (data.score > hs) {
              _setHighScore(data.mode, data.score);
              const newBest = this.add.text(W / 2, scoreTxt.y - 25, 'NEW BEST!', {
                fontFamily: FONT, fontSize: '14px', color: '#ffdd57', fontStyle: 'bold',
              }).setOrigin(0.5).setScale(0);
              this.tweens.add({ targets: newBest, scale: 1.2, duration: 300, ease: 'Back.easeOut',
                onComplete: () => this.tweens.add({ targets: newBest, scale: 1, duration: 200 }) });
              fireBurst(this, W / 2, scoreTxt.y);
            }
          },
        });
      },
    });

    // Correct/Total
    const correctTxt = this.add.text(W / 2, H * 0.32 + 80, `${data.correct}/${data.total}`, {
      fontFamily: FONT, fontSize: '24px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    const correctLbl = this.add.text(W / 2, H * 0.32 + 105, t('games.correct'), {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: [correctTxt, correctLbl], y: `-=30`, alpha: 1, duration: 350, delay: 550 });

    // Cocktail names as mini cards
    if (data.cocktailNames && data.cocktailNames.length > 0) {
      const names = [...new Set(data.cocktailNames)];
      const namesTxt = this.add.text(W / 2, H * 0.55, names.join(' | '), {
        fontFamily: FONT, fontSize: '13px', color: '#d4a44a',
        wordWrap: { width: W - 40 }, align: 'center',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: namesTxt, alpha: 1, duration: 300, delay: 600 });
    }

    // Feedback
    const fbTxt = this.add.text(W / 2, H * 0.60, t('games.feedback_q'), {
      fontFamily: FONT, fontSize: '14px', color: '#ccc',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: fbTxt, alpha: 1, duration: 300, delay: 700 });

    const fbY = H * 0.65;
    const thumbUp = btn(this, W / 2 - 40, fbY, 60, 40, '👍', 0x1a3a1a, () => {
      this._saveFeedback(data.mode, 'up');
      thumbUp.rect.setFillStyle(CLR.green, 0.4);
      GameAudio.sfxUIClick();
    });
    const thumbDown = btn(this, W / 2 + 40, fbY, 60, 40, '👎', 0x3a1a1a, () => {
      this._saveFeedback(data.mode, 'down');
      thumbDown.rect.setFillStyle(CLR.red, 0.4);
      GameAudio.sfxUIClick();
    });

    // Action buttons — premium styled
    const btnW = Math.min(W - 60, 240);
    const btnY = H * 0.73;

    if (data.cocktailNames && data.cocktailNames.length > 0) {
      btn(this, W / 2, btnY, btnW, 44, `📖 ${t('games.learn_recipe')}`, 0x7c3aed, () => {
        GameAudio.sfxUIClick();
        if (_onNavigate) _onNavigate('learn-recipe', data.cocktailNames[0]);
      });
    }

    // Play Again — most prominent
    const playAgainBtn = btn(this, W / 2, btnY + 56, btnW, 46, `🔄 ${t('games.play_again')}`, 0x059669, () => {
      GameAudio.sfxUIClick();
      this.scene.start(data.mode === 'mixology-rush' ? 'MixologyRushScene'
        : data.mode === 'ninja-shaker' ? 'NinjaShakerScene'
        : 'CocktailTinderScene');
    });
    // Subtle pulse on play again
    this.tweens.add({ targets: playAgainBtn.rect, scaleX: 1.02, scaleY: 1.02, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    btn(this, W / 2, btnY + 108, btnW, 42, `🕹️ ${t('games.menu')}`, CLR.surface2, () => {
      GameAudio.sfxUIClick();
      this.scene.start('MenuScene');
    });

    btn(this, W / 2, btnY + 158, btnW, 42, `← ${t('games.home')}`, 0x333333, () => {
      GameAudio.sfxUIClick();
      if (_onNavigate) _onNavigate('home');
    });
  }

  _saveFeedback(mode, vote) {
    try {
      const key = 'stirio_game_feedback';
      const fb = JSON.parse(localStorage.getItem(key) || '{}');
      if (!fb[mode]) fb[mode] = { up: 0, down: 0 };
      fb[mode][vote]++;
      localStorage.setItem(key, JSON.stringify(fb));
    } catch (_) { /* ignore */ }
  }
}

// ─── HIGH SCORE HELPERS ─────────────────────────────────────

function _getHighScore(mode) {
  try {
    const hs = JSON.parse(localStorage.getItem('stirio_game_high_scores') || '{}');
    return hs[mode]?.best || 0;
  } catch (_) { return 0; }
}

function _setHighScore(mode, score) {
  try {
    const hs = JSON.parse(localStorage.getItem('stirio_game_high_scores') || '{}');
    if (!hs[mode]) hs[mode] = { best: 0, gamesPlayed: 0 };
    hs[mode].best = Math.max(hs[mode].best, score);
    hs[mode].gamesPlayed++;
    localStorage.setItem('stirio_game_high_scores', JSON.stringify(hs));
  } catch (_) { /* ignore */ }
}

// ─── PHASER GAME LIFECYCLE ───────────────────────────────────

let game = null;
let _onNavigate = null; // callback to app.js for navigation

export function initGames(containerId, onNavigate) {
  _onNavigate = onNavigate;
  if (game) game.destroy(true);

  const container = document.getElementById(containerId);
  const w = container.clientWidth;
  const h = container.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: w,
    height: h,
    backgroundColor: '#0d0508',
    scale: {
      mode: Phaser.Scale.NONE,
      zoom: dpr,
    },
    render: {
      antialias: true,
      roundPixels: false,
      transparent: false,
    },
    scene: [MenuScene, MixologyRushScene, NinjaShakerScene, CocktailTinderScene, GameResultScene],
  });

  // Force canvas CSS size to fill container (canvas internal res is w*dpr × h*dpr)
  requestAnimationFrame(() => {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
  });
}

export function destroyGames() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
