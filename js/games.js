// ─── MINI GAMES (Phaser.js) ─────────────────────────────────
// Three arcade-style cocktail learning games powered by Phaser 3.
// Integrated into the Stirio SPA as a single view with a Phaser canvas.

import { fichas } from './fichas.js';
import { t, getLang } from './lang.js';

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

    // Animated background bubbles
    for (let i = 0; i < 18; i++) {
      const bx = Phaser.Math.Between(10, W - 10);
      const by = Phaser.Math.Between(0, H);
      const size = Phaser.Math.Between(2, 6);
      const bubble = this.add.circle(bx, by, size, CLR.accent, Phaser.Math.FloatBetween(0.05, 0.15));
      this.tweens.add({
        targets: bubble, y: -20, duration: Phaser.Math.Between(6000, 12000),
        ease: 'Linear', repeat: -1,
        onRepeat: () => { bubble.x = Phaser.Math.Between(10, W - 10); bubble.y = H + 20; },
      });
    }

    // Title glow (behind)
    const titleGlow = this.add.text(W / 2, 44, t('games.menu_title'), {
      fontFamily: FONT, fontSize: '26px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setAlpha(0.25);
    this.tweens.add({ targets: titleGlow, alpha: 0.12, duration: 1500, yoyo: true, repeat: -1 });

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

      // Card glow behind
      const glowBg = this.add.rectangle(W / 2, cy, cardW + 4, cardH + 4, c.glow, 0.12);
      glowBg.setStrokeStyle(0);

      // Card background
      const bg = this.add.rectangle(W / 2, cy, cardW, cardH, c.color, 0.88)
        .setInteractive();
      bg.setStrokeStyle(1, 0xffffff, 0.2);

      // Icon
      const iconTxt = this.add.text(W / 2 - cardW / 2 + 24, cy - 4, c.icon, {
        fontSize: '38px',
      }).setOrigin(0, 0.5);

      // Name
      const nameTxt = this.add.text(W / 2 - cardW / 2 + 74, cy - 16, c.name, {
        fontFamily: FONT, fontSize: '19px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      // Description
      const descTxt = this.add.text(W / 2 - cardW / 2 + 74, cy + 14, c.desc, {
        fontFamily: FONT, fontSize: '13px', color: '#ddd',
      }).setOrigin(0, 0.5);

      // Entrance animation: slide in from right with stagger
      const elements = [glowBg, bg, iconTxt, nameTxt, descTxt];
      elements.forEach(el => { el.x += W; el.alpha = 0; });
      this.tweens.add({
        targets: elements,
        x: `-=${W}`, alpha: 1,
        duration: 400, ease: 'Back.easeOut',
        delay: i * 150,
      });

      // Press feedback
      bg.on('pointerdown', () => {
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

    // Background ambiance bubbles
    for (let i = 0; i < 8; i++) {
      const b = this.add.circle(Phaser.Math.Between(10, W - 10), Phaser.Math.Between(0, H), Phaser.Math.Between(1, 4), CLR.accent, 0.06);
      this.tweens.add({ targets: b, y: -10, duration: Phaser.Math.Between(5000, 10000), ease: 'Linear', repeat: -1,
        onRepeat: () => { b.x = Phaser.Math.Between(10, W - 10); b.y = H + 10; },
      });
    }

    const cocktail = this.recipes[Math.floor(Math.random() * this.recipes.length)];
    this.currentCocktail = cocktail;
    this.cocktailNames.push(cocktail.name);
    this.correctNeeded = cocktail.ingredients.length;
    this.correctCount = 0;

    // Round indicator
    this.add.text(W / 2, 12, `${t('games.round')} ${this.round + 1}/${this.totalRounds}`, {
      fontFamily: FONT, fontSize: '14px', color: '#999',
    }).setOrigin(0.5, 0);

    // Cocktail name
    this.add.text(W / 2, 38, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '22px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Score
    this.scoreTxt = this.add.text(W - 16, 12, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    }).setOrigin(1, 0);

    // Timer bar
    this.timerBg = this.add.rectangle(W / 2, 70, W - 32, 8, 0x333333).setOrigin(0.5);
    this.timerFill = this.add.rectangle(16, 70, W - 32, 8, CLR.accent).setOrigin(0, 0.5);
    this.timeLeft = 30;
    this.timerEvent = this.time.addEvent({
      delay: 1000, repeat: 29,
      callback: () => { this.timeLeft--; this._updateTimer(); },
    });

    // Urgency vignette rects (hidden initially)
    this.vignetteRects = [
      this.add.rectangle(0, H / 2, 30, H, 0xff0000, 0).setOrigin(0, 0.5),
      this.add.rectangle(W, H / 2, 30, H, 0xff0000, 0).setOrigin(1, 0.5),
    ];

    // Shaker zone — enhanced with glow ring + orbit particles
    const shakerY = H - 100;
    // Outer glow
    this.shakerGlow = this.add.circle(W / 2, shakerY, 60, CLR.accent, 0.08);
    this.tweens.add({ targets: this.shakerGlow, scale: 1.15, alpha: 0.03, duration: 1200, yoyo: true, repeat: -1 });
    // Inner shaker
    this.shaker = this.add.circle(W / 2, shakerY, 50, CLR.surface2, 0.9);
    this.shaker.setStrokeStyle(3, CLR.accent);
    this.shakerEmoji = this.add.text(W / 2, shakerY - 8, '🍸', { fontSize: '40px' }).setOrigin(0.5);
    this.add.text(W / 2, shakerY + 32, t('games.drag_here'), {
      fontFamily: FONT, fontSize: '12px', color: '#999',
    }).setOrigin(0.5);

    // Orbit particles around shaker
    for (let i = 0; i < 5; i++) {
      const orb = this.add.circle(W / 2, shakerY, 3, CLR.accent, 0.4);
      const angle = (Math.PI * 2 * i) / 5;
      this.tweens.add({
        targets: orb, angle: 360,
        duration: 3000, repeat: -1, ease: 'Linear',
        onUpdate: (tw) => {
          const a = angle + (tw.progress * Math.PI * 2);
          orb.x = W / 2 + Math.cos(a) * 58;
          orb.y = shakerY + Math.sin(a) * 58;
        },
      });
    }

    // Ingredient cards
    const distractors = getDistractors(this.recipes, cocktail, Math.min(4, 8 - cocktail.ingredients.length));
    const allIngredients = shuffle([
      ...cocktail.ingredients.map(i => ({ name: i, correct: true })),
      ...distractors.map(i => ({ name: i, correct: false })),
    ]);
    this._createIngredientCards(allIngredients, W, H, shakerY);

    // Drag events
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      obj.x = dragX; obj.y = dragY;
      if (obj._label) { obj._label.x = dragX; obj._label.y = dragY; }
      if (obj._emojiTxt) { obj._emojiTxt.x = dragX - obj._emojiOffsetX; obj._emojiTxt.y = dragY; }
    });
    this.input.on('dragend', (pointer, obj) => this._onDrop(obj));
  }

  _createIngredientCards(ingredients, W, H, shakerY) {
    const cardW = Math.min(145, (W - 40) / 2);
    const cardH = 52;
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

      // Card with gradient effect (darker inner + lighter border)
      const card = this.add.rectangle(x, y, cardW, cardH, ing.correct ? 0x2d1f3d : 0x1f2d2d, 0.92)
        .setInteractive({ draggable: true });
      card.setStrokeStyle(1.5, ing.correct ? 0x6b4fa2 : 0x3d6b5d, 0.5);
      card._correct = ing.correct;
      card._origX = x;
      card._origY = y;
      card._ingName = ing.name;

      // Emoji icon on the left
      const emojiTxt = this.add.text(x - cardW / 2 + 14, y, emoji, {
        fontSize: '22px',
      }).setOrigin(0, 0.5);
      card._emojiTxt = emojiTxt;
      card._emojiOffsetX = cardW / 2 - 14;

      // Ingredient name
      const label = this.add.text(x + 8, y, ing.name, {
        fontFamily: FONT, fontSize: '12px', color: '#eee', wordWrap: { width: cardW - 50 },
      }).setOrigin(0.5);
      card._label = label;

      // Entrance animation
      card.alpha = 0; label.alpha = 0; emojiTxt.alpha = 0;
      this.tweens.add({
        targets: [card, label, emojiTxt], alpha: 1,
        duration: 300, delay: i * 50, ease: 'Power2',
      });
    });
  }

  _onDrop(obj) {
    const dist = Phaser.Math.Distance.Between(obj.x, obj.y, this.shaker.x, this.shaker.y);
    if (dist < 70) {
      if (obj._correct) {
        this.correctCount++;
        this.correctTotal++;
        const pts = 100 + Math.floor(this.timeLeft * 3);
        this.score += pts;
        this.scoreTxt.setText(`${this.score} pts`);

        // Particle burst + floating score
        const emoji = getIngredientEmoji(obj._ingName);
        particleBurst(this, this.shaker.x, this.shaker.y, 12, CLR.green, { emoji, spread: 50 });
        floatingText(this, this.shaker.x, this.shaker.y - 40, `+${pts}`, '#34d399', '16px');

        // Screen shake
        this.cameras.main.shake(100, 0.005);

        // Destroy card elements
        this.tweens.add({
          targets: [obj, obj._label, obj._emojiTxt].filter(Boolean),
          scale: 0, alpha: 0, duration: 200,
          onComplete: () => { obj.destroy(); obj._label?.destroy(); obj._emojiTxt?.destroy(); },
        });
        this._flashShaker(CLR.green);

        if (this.correctCount >= this.correctNeeded) this._endRound(true);
      } else {
        this._flashShaker(CLR.red);
        this.cameras.main.shake(80, 0.003);
        screenFlash(this, 255, 0, 0, 120, 0.2);
        this._bounceBack(obj);
      }
    } else {
      this._bounceBack(obj);
    }
  }

  _bounceBack(obj) {
    const targets = [obj, obj._label, obj._emojiTxt].filter(Boolean);
    targets.forEach(t => {
      const targetX = t === obj._emojiTxt ? obj._origX - obj._emojiOffsetX : obj._origX;
      this.tweens.add({ targets: t, x: targetX, y: obj._origY, duration: 250, ease: 'Back' });
    });
  }

  _flashShaker(color) {
    this.shaker.setFillStyle(color, 0.7);
    this.time.delayedCall(200, () => this.shaker.setFillStyle(CLR.surface2, 0.9));
  }

  _updateTimer() {
    const { width: W } = this.scale;
    const pct = this.timeLeft / 30;
    this.timerFill.width = (W - 32) * pct;
    if (this.timeLeft <= 10) {
      this.timerFill.setFillStyle(CLR.red);
      // Pulsing red vignette at screen edges
      const vigAlpha = this.timeLeft <= 5 ? 0.15 : 0.08;
      this.vignetteRects.forEach(v => {
        this.tweens.add({ targets: v, alpha: vigAlpha, duration: 400, yoyo: true });
      });
    }
    if (this.timeLeft <= 0) this._endRound(false);
  }

  _endRound(completed) {
    if (this.timerEvent) this.timerEvent.remove();
    this.round++;
    if (this.round < this.totalRounds) {
      this.time.delayedCall(600, () => this._startRound());
    } else {
      this.scene.start('GameResultScene', {
        mode: 'mixology-rush',
        score: this.score,
        correct: this.correctTotal,
        total: this.totalRounds * 3,
        cocktailNames: this.cocktailNames,
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

    // Background ambiance
    for (let i = 0; i < 12; i++) {
      const b = this.add.circle(Phaser.Math.Between(10, W - 10), Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 4), CLR.accent, Phaser.Math.FloatBetween(0.03, 0.08));
      this.tweens.add({
        targets: b, y: -10, duration: Phaser.Math.Between(6000, 14000),
        ease: 'Linear', repeat: -1,
        onRepeat: () => { b.x = Phaser.Math.Between(10, W - 10); b.y = H + 10; },
      });
    }

    const recipes = getRecipes();
    const cocktail = recipes[Math.floor(Math.random() * recipes.length)];
    this.cocktail = cocktail;
    this.correctSet = new Set(cocktail.ingredients);

    const distractors = getDistractors(recipes, cocktail, 12);
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
    this.maxSpawn = 25;
    this.items = [];
    this.ended = false;

    // Header
    this.add.text(W / 2, 12, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '20px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.scoreTxt = this.add.text(16, 12, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    });

    this.livesTxt = this.add.text(W - 16, 12, '❤️'.repeat(this.lives), {
      fontSize: '16px',
    }).setOrigin(1, 0);

    this.comboTxt = this.add.text(W / 2, 42, '', {
      fontFamily: FONT, fontSize: '16px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.spawnTimer = this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => this._spawnItem(),
    });

    this.input.on('pointerdown', (pointer) => this._onTap(pointer));
  }

  _spawnItem() {
    if (this.ended || this.totalSpawned >= this.maxSpawn) return;
    const { width: W, height: H } = this.scale;

    const ing = this.pool[this.poolIdx % this.pool.length];
    this.poolIdx++;
    this.totalSpawned++;

    const emoji = getIngredientEmoji(ing.name);
    const x = Phaser.Math.Between(50, W - 50);
    const startY = H + 40;
    const peakY = Phaser.Math.Between(90, H * 0.4);

    // Orb: subtler color distinction (both dark tones)
    const orbColor = ing.correct ? 0x2a1845 : 0x1a2830;
    const circle = this.add.circle(x, startY, 32, orbColor, 0.9);
    circle.setStrokeStyle(2, ing.correct ? 0x6b4fa2 : 0x4a6b7a, 0.5);

    // Emoji icon centered in the orb
    const emojiTxt = this.add.text(x, startY - 4, emoji, {
      fontSize: '26px',
    }).setOrigin(0.5);

    // Small name label below
    const label = this.add.text(x, startY + 18, ing.name, {
      fontFamily: FONT, fontSize: '9px', color: '#bbb',
      wordWrap: { width: 62 }, align: 'center',
    }).setOrigin(0.5, 0);

    const item = { circle, emojiTxt, label, correct: ing.correct, alive: true, ingName: ing.name };
    this.items.push(item);

    // Trail effect
    const trailTimer = this.time.addEvent({
      delay: 80, loop: true,
      callback: () => {
        if (!item.alive) { trailTimer.remove(); return; }
        const trail = this.add.circle(circle.x, circle.y, 4, orbColor, 0.25);
        this.tweens.add({ targets: trail, alpha: 0, scale: 0, duration: 300, onComplete: () => trail.destroy() });
      },
    });
    item._trailTimer = trailTimer;

    // Arc tween
    const endX = x + Phaser.Math.Between(-40, 40);
    const dur = Phaser.Math.Between(1800, 2400);
    const allTargets = [circle, emojiTxt, label];

    this.tweens.add({
      targets: allTargets, y: peakY, x: endX,
      duration: dur * 0.45, ease: 'Sine.easeOut',
      onUpdate: () => { emojiTxt.y = circle.y - 4; label.y = circle.y + 18; emojiTxt.x = circle.x; label.x = circle.x; },
      onComplete: () => {
        this.tweens.add({
          targets: allTargets, y: H + 60,
          duration: dur * 0.55, ease: 'Sine.easeIn',
          onUpdate: () => { emojiTxt.y = circle.y - 4; label.y = circle.y + 18; emojiTxt.x = circle.x; label.x = circle.x; },
          onComplete: () => {
            if (item.alive) {
              item.alive = false;
              if (item._trailTimer) item._trailTimer.remove();
              circle.destroy(); emojiTxt.destroy(); label.destroy();
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
          this.score += pts;
          this.scoreTxt.setText(`${this.score} pts`);

          // Slice effect with emoji
          this._sliceEffect(ix, iy, CLR.green, getIngredientEmoji(item.ingName));
          floatingText(this, ix, iy - 30, `+${pts}`, '#34d399', '15px');
          this.cameras.main.shake(80, 0.003);

          // Combo display
          if (this.combo >= 3) {
            this.comboTxt.setText(`${t('games.combo')} x${this.combo}!`);
            this.comboTxt.setScale(1.4);
            this.tweens.add({ targets: this.comboTxt, scale: 1, duration: 300, ease: 'Back.easeOut' });
            if (this.combo >= 5) {
              this.comboTxt.setColor('#ffaa00');
            }
          }
        } else {
          this.combo = 0;
          this.lives--;
          this.livesTxt.setText('❤️'.repeat(Math.max(0, this.lives)));
          this.comboTxt.setText('');
          this.comboTxt.setColor('#d4a44a');

          this._sliceEffect(ix, iy, CLR.red);
          this.cameras.main.shake(150, 0.008);
          screenFlash(this, 255, 0, 0, 200, 0.3);

          // Life lost X animation
          const xMark = this.add.text(ix, iy, '✕', {
            fontSize: '48px', color: '#ef4444', fontStyle: 'bold',
          }).setOrigin(0.5);
          this.tweens.add({ targets: xMark, scale: 2, alpha: 0, duration: 500, onComplete: () => xMark.destroy() });

          if (this.lives <= 0) {
            item.circle.destroy(); item.emojiTxt.destroy(); item.label.destroy();
            this._endGame(); return;
          }
        }
        item.circle.destroy(); item.emojiTxt.destroy(); item.label.destroy();
        this._checkEnd();
        return;
      }
    }
  }

  _sliceEffect(x, y, color, emoji) {
    // Slash line
    const slash = this.add.rectangle(x, y, 60, 3, 0xffffff, 0.8);
    slash.setAngle(Phaser.Math.Between(-30, 30));
    this.tweens.add({ targets: slash, alpha: 0, scaleX: 1.5, duration: 300, onComplete: () => slash.destroy() });

    // Directional particles
    particleBurst(this, x, y, 12, color, { emoji, spread: 55, duration: 400 });
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

    // Header
    this.add.text(W / 2, 16, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '20px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Directional glow rects (hidden, alpha updated on drag)
    this.glowLeft = this.add.rectangle(0, H / 2, 50, H, 0xff0000, 0).setOrigin(0, 0.5);
    this.glowRight = this.add.rectangle(W, H / 2, 50, H, 0x00ff88, 0).setOrigin(1, 0.5);

    // Side hints
    this.add.text(18, H / 2, t('games.swipe_left'), {
      fontFamily: FONT, fontSize: '11px', color: '#ef4444',
    }).setOrigin(0, 0.5).setAngle(-90).setAlpha(0.6);

    this.add.text(W - 18, H / 2, t('games.swipe_right'), {
      fontFamily: FONT, fontSize: '11px', color: '#34d399',
    }).setOrigin(1, 0.5).setAngle(90).setAlpha(0.6);

    this.scoreTxt = this.add.text(W / 2, 46, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    }).setOrigin(0.5, 0);

    this.progressTxt = this.add.text(W / 2, H - 30, `1/${this.total}`, {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5);

    this.streakTxt = this.add.text(W / 2, 66, '', {
      fontFamily: FONT, fontSize: '15px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this._showCard();
  }

  _showCard() {
    if (this.deckIdx >= this.deck.length) { this._endGame(); return; }

    const { width: W, height: H } = this.scale;
    const card = this.deck[this.deckIdx];
    const emoji = getIngredientEmoji(card.name);
    const cardW = Math.min(W - 60, 270);
    const cardH = 200;
    const cx = W / 2, cy = H / 2 + 10;

    // Card background
    this.cardBg = this.add.rectangle(cx, cy, cardW, cardH, CLR.surface2, 0.95)
      .setInteractive({ draggable: true });
    this.cardBg.setStrokeStyle(2, 0x555555);
    this.cardBg._belongs = card.belongs;
    this.cardBg._origX = cx;
    this.cardBg._ingName = card.name;

    // Emoji icon (large, centered above name)
    this.cardEmoji = this.add.text(cx, cy - 35, emoji, {
      fontSize: '48px',
    }).setOrigin(0.5);

    // Ingredient name
    this.cardLabel = this.add.text(cx, cy + 20, card.name, {
      fontFamily: FONT, fontSize: '19px', color: '#fff', fontStyle: 'bold',
      wordWrap: { width: cardW - 24 }, align: 'center',
    }).setOrigin(0.5);

    // Hint indicator
    this.cardHint = this.add.text(cx, cy + 65, '?', {
      fontFamily: FONT, fontSize: '14px', color: '#999',
    }).setOrigin(0.5);

    // Shine animation (diagonal line crossing card)
    const shine = this.add.rectangle(cx - cardW, cy, 8, cardH * 1.4, 0xffffff, 0.08);
    shine.setAngle(20);
    this.tweens.add({
      targets: shine, x: cx + cardW, duration: 600, ease: 'Power2',
      onComplete: () => shine.destroy(),
    });

    // Card entrance: scale from 0.8
    const allCardEls = [this.cardBg, this.cardEmoji, this.cardLabel, this.cardHint];
    allCardEls.forEach(el => el.setScale(0.85).setAlpha(0.5));
    this.tweens.add({ targets: allCardEls, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });

    this.progressTxt.setText(`${this.deckIdx + 1}/${this.total}`);

    this.input.on('drag', this._onDrag, this);
    this.input.on('dragend', this._onDragEnd, this);
  }

  _onDrag(pointer, obj, dragX) {
    if (obj !== this.cardBg) return;
    obj.x = dragX;
    this.cardLabel.x = dragX;
    this.cardHint.x = dragX;
    this.cardEmoji.x = dragX;

    const diff = dragX - obj._origX;
    const rot = diff * 0.002;
    obj.rotation = rot;
    this.cardLabel.rotation = rot;
    this.cardEmoji.rotation = rot;

    // Directional glow
    const { width: W } = this.scale;
    const absDiff = Math.abs(diff);
    const glowAlpha = Math.min(absDiff / (W * 0.3), 0.25);
    if (diff > 40) {
      obj.setStrokeStyle(3, CLR.green);
      this.cardHint.setText('✓').setColor('#34d399');
      this.glowRight.setAlpha(glowAlpha);
      this.glowLeft.setAlpha(0);
    } else if (diff < -40) {
      obj.setStrokeStyle(3, CLR.red);
      this.cardHint.setText('✗').setColor('#ef4444');
      this.glowLeft.setAlpha(glowAlpha);
      this.glowRight.setAlpha(0);
    } else {
      obj.setStrokeStyle(2, 0x555555);
      this.cardHint.setText('?').setColor('#999');
      this.glowLeft.setAlpha(0);
      this.glowRight.setAlpha(0);
    }
  }

  _onDragEnd(pointer, obj) {
    if (obj !== this.cardBg) return;
    const { width: W } = this.scale;
    const diff = obj.x - obj._origX;
    const threshold = W * 0.2;

    // Reset glow
    this.glowLeft.setAlpha(0);
    this.glowRight.setAlpha(0);

    if (Math.abs(diff) > threshold) {
      const swipedRight = diff > 0;
      const isCorrect = swipedRight === obj._belongs;
      const ix = obj.x, iy = obj.y;

      if (isCorrect) {
        this.correct++;
        this.streak++;
        const bonus = Math.min(this.streak, 5) * 20;
        const pts = 100 + bonus;
        this.score += pts;
        floatingText(this, W / 2, iy - 60, `+${pts}`, '#34d399', '16px');

        if (this.streak >= 3) {
          this.streakTxt.setText(`🔥 ${t('games.streak')} x${this.streak}`);
          this.streakTxt.setScale(1.3);
          this.tweens.add({ targets: this.streakTxt, scale: 1, duration: 300, ease: 'Back.easeOut' });
        }
      } else {
        this.streak = 0;
        this.streakTxt.setText('');
        this.cameras.main.shake(100, 0.005);
      }
      this.scoreTxt.setText(`${this.score} pts`);

      const flyX = diff > 0 ? W + 200 : -200;
      const allEls = [this.cardBg, this.cardLabel, this.cardHint, this.cardEmoji];
      this.tweens.add({
        targets: allEls,
        x: flyX, alpha: 0, duration: 250, ease: 'Power2',
        onComplete: () => {
          this._showFeedback(isCorrect, ix, iy);
          allEls.forEach(el => el.destroy());
          this.input.off('drag', this._onDrag, this);
          this.input.off('dragend', this._onDragEnd, this);
          this.deckIdx++;
          this.time.delayedCall(350, () => this._showCard());
        },
      });
    } else {
      // Snap back
      const allEls = [this.cardBg, this.cardLabel, this.cardHint, this.cardEmoji];
      this.tweens.add({
        targets: allEls,
        x: obj._origX, rotation: 0, duration: 200, ease: 'Back',
      });
    }
  }

  _showFeedback(correct, x, y) {
    const { width: W, height: H } = this.scale;
    const color = correct ? CLR.green : CLR.red;
    particleBurst(this, W / 2, H / 2, 10, color, { spread: 45, duration: 400 });

    const fb = this.add.text(W / 2, H / 2, correct ? '✓' : '✗', {
      fontSize: '64px', color: correct ? '#34d399' : '#ef4444',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: fb, alpha: 0, scale: 2, duration: 450,
      onComplete: () => fb.destroy(),
    });
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

    // Confetti for good results
    if (pct >= 0.5) {
      const confettiCount = pct >= 0.8 ? 35 : 15;
      const confettiColors = [0xd4a44a, 0x34d399, 0x7c3aed, 0xef4444, 0x3498db, 0xff6b6b];
      for (let i = 0; i < confettiCount; i++) {
        const cx = Phaser.Math.Between(20, W - 20);
        const confetti = this.add.rectangle(cx, -10,
          Phaser.Math.Between(4, 8), Phaser.Math.Between(8, 14),
          Phaser.Math.RND.pick(confettiColors), 0.8);
        confetti.setAngle(Phaser.Math.Between(0, 360));
        this.tweens.add({
          targets: confetti,
          y: H + 20, x: cx + Phaser.Math.Between(-60, 60),
          angle: Phaser.Math.Between(180, 720),
          duration: Phaser.Math.Between(2000, 4000),
          delay: Phaser.Math.Between(0, 800),
          ease: 'Sine.easeIn',
          onComplete: () => confetti.destroy(),
        });
      }
    }

    // Emoji — bounce in from top
    const emojiTxt = this.add.text(W / 2, -60, emojiChar, { fontSize: '64px' }).setOrigin(0.5);
    this.tweens.add({ targets: emojiTxt, y: H * 0.12, duration: 600, ease: 'Bounce.easeOut' });

    // Title — fade in with delay
    const titleTxt = this.add.text(W / 2, H * 0.22, title, {
      fontFamily: FONT, fontSize: '26px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: titleTxt, alpha: 1, duration: 300, delay: 250 });

    // Stats — slide up with stagger
    const stats = [
      { label: t('games.score'), val: `${data.score}` },
      { label: t('games.correct'), val: `${data.correct}/${data.total}` },
    ];
    stats.forEach((s, i) => {
      const sy = H * 0.32 + i * 50;
      const valTxt = this.add.text(W / 2, sy + 30, s.val, {
        fontFamily: FONT, fontSize: '28px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0);
      const lblTxt = this.add.text(W / 2, sy + 58, s.label, {
        fontFamily: FONT, fontSize: '13px', color: '#999',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: [valTxt, lblTxt], y: `-=30`, alpha: 1, duration: 350, delay: 400 + i * 150 });
    });

    // Cocktail names
    if (data.cocktailNames && data.cocktailNames.length > 0) {
      const names = [...new Set(data.cocktailNames)].join(', ');
      const namesTxt = this.add.text(W / 2, H * 0.52, names, {
        fontFamily: FONT, fontSize: '14px', color: '#d4a44a',
        wordWrap: { width: W - 40 }, align: 'center',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: namesTxt, alpha: 1, duration: 300, delay: 600 });
    }

    // Feedback
    const fbTxt = this.add.text(W / 2, H * 0.60, t('games.feedback_q'), {
      fontFamily: FONT, fontSize: '14px', color: '#ccc',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: fbTxt, alpha: 1, duration: 300, delay: 700 });

    const fbY = H * 0.66;
    const thumbUp = btn(this, W / 2 - 40, fbY, 60, 40, '👍', 0x1a3a1a, () => {
      this._saveFeedback(data.mode, 'up');
      thumbUp.rect.setFillStyle(CLR.green, 0.4);
    });
    const thumbDown = btn(this, W / 2 + 40, fbY, 60, 40, '👎', 0x3a1a1a, () => {
      this._saveFeedback(data.mode, 'down');
      thumbDown.rect.setFillStyle(CLR.red, 0.4);
    });

    // Action buttons
    const btnW = Math.min(W - 60, 240);
    const btnY = H * 0.76;

    if (data.cocktailNames && data.cocktailNames.length > 0) {
      btn(this, W / 2, btnY, btnW, 44, `📖 ${t('games.learn_recipe')}`, 0x7c3aed, () => {
        if (_onNavigate) _onNavigate('learn-recipe', data.cocktailNames[0]);
      });
    }

    btn(this, W / 2, btnY + 56, btnW, 44, `🔄 ${t('games.play_again')}`, CLR.surface2, () => {
      this.scene.start(data.mode === 'mixology-rush' ? 'MixologyRushScene'
        : data.mode === 'ninja-shaker' ? 'NinjaShakerScene'
        : 'CocktailTinderScene');
    });

    btn(this, W / 2, btnY + 112, btnW, 44, `🕹️ ${t('games.menu')}`, CLR.surface2, () => {
      this.scene.start('MenuScene');
    });

    btn(this, W / 2, btnY + 168, btnW, 44, `← ${t('games.home')}`, 0x333333, () => {
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

// ─── PHASER GAME LIFECYCLE ───────────────────────────────────

let game = null;
let _onNavigate = null; // callback to app.js for navigation

export function initGames(containerId, onNavigate) {
  _onNavigate = onNavigate;
  if (game) game.destroy(true);

  const container = document.getElementById(containerId);
  const w = container.clientWidth;
  const h = container.clientHeight;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: w,
    height: h,
    backgroundColor: '#0d0508',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MenuScene, MixologyRushScene, NinjaShakerScene, CocktailTinderScene, GameResultScene],
  });
}

export function destroyGames() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
