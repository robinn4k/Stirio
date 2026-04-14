// ─── MINI GAMES (Phaser.js) ─────────────────────────────────
// Three arcade-style cocktail learning games powered by Phaser 3.
// Integrated into the Stirio SPA as a single view with a Phaser canvas.

import { fichas } from './fichas.js';
import { t, getLang } from './lang.js';

// ─── DATA HELPERS ────────────────────────────────────────────

function stripQty(str) {
  return str.replace(/^\d+(\.\d+)?\s*(ml|cl|oz|dash|drops?|barspoon|splash|top)\s*/i, '').trim();
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

// ─── MENU SCENE ──────────────────────────────────────────────

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width: W, height: H } = this.scale;

    // Title
    this.add.text(W / 2, 40, t('games.menu_title'), {
      fontFamily: FONT, fontSize: '24px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    const cards = [
      { key: 'MixologyRushScene', icon: '🍸', name: t('games.mixology_rush'), desc: t('games.mixology_desc'), color: 0x7c3aed },
      { key: 'NinjaShakerScene',  icon: '🔪', name: t('games.ninja_shaker'),  desc: t('games.ninja_desc'),    color: 0x059669 },
      { key: 'CocktailTinderScene', icon: '💘', name: t('games.cocktail_tinder'), desc: t('games.tinder_desc'), color: 0xdc2626 },
    ];

    const cardW = Math.min(W - 40, 340);
    const cardH = 90;
    const gap = 20;
    const startY = 100;

    cards.forEach((c, i) => {
      const cy = startY + i * (cardH + gap) + cardH / 2;
      const bg = this.add.rectangle(W / 2, cy, cardW, cardH, c.color, 0.85)
        .setInteractive();
      bg.setStrokeStyle(2, 0xffffff, 0.15);

      this.add.text(W / 2 - cardW / 2 + 20, cy - 18, c.icon, {
        fontSize: '32px',
      }).setOrigin(0, 0.5);

      this.add.text(W / 2 - cardW / 2 + 65, cy - 14, c.name, {
        fontFamily: FONT, fontSize: '18px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      this.add.text(W / 2 - cardW / 2 + 65, cy + 14, c.desc, {
        fontFamily: FONT, fontSize: '13px', color: '#ddd',
      }).setOrigin(0, 0.5);

      bg.on('pointerdown', () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => this.scene.start(c.key));
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

    this._startRound();
  }

  _startRound() {
    // Clear previous objects
    this.children.removeAll(true);
    const { width: W, height: H } = this.scale;

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

    // Shaker zone (drop target)
    const shakerY = H - 100;
    this.shaker = this.add.circle(W / 2, shakerY, 50, CLR.surface2, 0.9);
    this.shaker.setStrokeStyle(3, CLR.accent);
    this.add.text(W / 2, shakerY - 8, '🍸', { fontSize: '36px' }).setOrigin(0.5);
    this.add.text(W / 2, shakerY + 30, t('games.drag_here'), {
      fontFamily: FONT, fontSize: '12px', color: '#999',
    }).setOrigin(0.5);

    // Ingredient cards (correct + distractors)
    const distractors = getDistractors(this.recipes, cocktail, Math.min(4, 8 - cocktail.ingredients.length));
    const allIngredients = shuffle([
      ...cocktail.ingredients.map(i => ({ name: i, correct: true })),
      ...distractors.map(i => ({ name: i, correct: false })),
    ]);

    this._createIngredientCards(allIngredients, W, H, shakerY);

    // Drag events
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      obj.x = dragX; obj.y = dragY;
      obj._label.x = dragX; obj._label.y = dragY;
    });
    this.input.on('dragend', (pointer, obj) => this._onDrop(obj));
  }

  _createIngredientCards(ingredients, W, H, shakerY) {
    const cardW = Math.min(130, (W - 48) / 2);
    const cardH = 40;
    const cols = 2;
    const startY = 100;
    const gapX = 16;
    const gapY = 12;

    ingredients.forEach((ing, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (W / 2) - ((cols * cardW + (cols - 1) * gapX) / 2) + col * (cardW + gapX) + cardW / 2;
      const y = startY + row * (cardH + gapY) + cardH / 2;

      const card = this.add.rectangle(x, y, cardW, cardH, ing.correct ? 0x2d1f3d : 0x1f2d2d, 0.9)
        .setInteractive({ draggable: true });
      card.setStrokeStyle(1, 0x555555);
      card._correct = ing.correct;
      card._origX = x;
      card._origY = y;

      const label = this.add.text(x, y, ing.name, {
        fontFamily: FONT, fontSize: '13px', color: '#eee', wordWrap: { width: cardW - 12 },
      }).setOrigin(0.5);
      card._label = label;
    });
  }

  _onDrop(obj) {
    const dist = Phaser.Math.Distance.Between(obj.x, obj.y, this.shaker.x, this.shaker.y);
    if (dist < 70) {
      if (obj._correct) {
        // Correct drop
        this.correctCount++;
        this.correctTotal++;
        this.score += 100 + Math.floor(this.timeLeft * 3);
        this.scoreTxt.setText(`${this.score} pts`);

        this.tweens.add({ targets: [obj, obj._label], scale: 0, alpha: 0, duration: 200,
          onComplete: () => { obj.destroy(); obj._label.destroy(); },
        });
        this._flashShaker(CLR.green);

        if (this.correctCount >= this.correctNeeded) this._endRound(true);
      } else {
        // Wrong drop
        this._flashShaker(CLR.red);
        this._bounceBack(obj);
      }
    } else {
      this._bounceBack(obj);
    }
  }

  _bounceBack(obj) {
    this.tweens.add({ targets: obj, x: obj._origX, y: obj._origY, duration: 250, ease: 'Back' });
    this.tweens.add({ targets: obj._label, x: obj._origX, y: obj._origY, duration: 250, ease: 'Back' });
  }

  _flashShaker(color) {
    this.shaker.setFillStyle(color, 0.7);
    this.time.delayedCall(200, () => this.shaker.setFillStyle(CLR.surface2, 0.9));
  }

  _updateTimer() {
    const { width: W } = this.scale;
    const pct = this.timeLeft / 30;
    this.timerFill.width = (W - 32) * pct;
    if (this.timeLeft <= 10) this.timerFill.setFillStyle(CLR.red);
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

    const recipes = getRecipes();
    const cocktail = recipes[Math.floor(Math.random() * recipes.length)];
    this.cocktail = cocktail;
    this.correctSet = new Set(cocktail.ingredients);

    // Build ingredient pool (correct + distractors)
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

    // Score text
    this.scoreTxt = this.add.text(16, 12, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    });

    // Lives
    this.livesTxt = this.add.text(W - 16, 12, '❤️'.repeat(this.lives), {
      fontSize: '16px',
    }).setOrigin(1, 0);

    // Combo text
    this.comboTxt = this.add.text(W / 2, 42, '', {
      fontFamily: FONT, fontSize: '14px', color: '#34d399',
    }).setOrigin(0.5, 0);

    // Spawn timer
    this.spawnTimer = this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => this._spawnItem(),
    });

    // Tap/swipe detection
    this.input.on('pointerdown', (pointer) => this._onTap(pointer));
  }

  _spawnItem() {
    if (this.ended || this.totalSpawned >= this.maxSpawn) return;
    const { width: W, height: H } = this.scale;

    const ing = this.pool[this.poolIdx % this.pool.length];
    this.poolIdx++;
    this.totalSpawned++;

    const x = Phaser.Math.Between(40, W - 40);
    const startY = H + 30;
    const peakY = Phaser.Math.Between(80, H * 0.4);

    const circle = this.add.circle(x, startY, 30, ing.correct ? 0x7c3aed : 0xdc2626, 0.85);
    circle.setStrokeStyle(2, 0xffffff, 0.3);

    const label = this.add.text(x, startY, ing.name, {
      fontFamily: FONT, fontSize: '11px', color: '#fff',
      wordWrap: { width: 56 }, align: 'center',
    }).setOrigin(0.5);

    const item = { circle, label, correct: ing.correct, alive: true };
    this.items.push(item);

    // Arc tween: rise up, then fall down
    const endX = x + Phaser.Math.Between(-40, 40);
    const dur = Phaser.Math.Between(1800, 2400);

    this.tweens.add({
      targets: [circle, label], y: peakY, x: endX,
      duration: dur * 0.45, ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [circle, label], y: H + 50,
          duration: dur * 0.55, ease: 'Sine.easeIn',
          onComplete: () => {
            if (item.alive) {
              item.alive = false;
              circle.destroy(); label.destroy();
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
      if (dist < 40) {
        item.alive = false;
        if (item.correct) {
          this.correct++;
          this.combo++;
          const bonus = Math.min(this.combo, 5) * 20;
          this.score += 100 + bonus;
          this.scoreTxt.setText(`${this.score} pts`);
          if (this.combo >= 3) this.comboTxt.setText(`${t('games.combo')} x${this.combo}!`);
          this._sliceEffect(item.circle.x, item.circle.y, 0x34d399);
        } else {
          this.combo = 0;
          this.lives--;
          this.livesTxt.setText('❤️'.repeat(Math.max(0, this.lives)));
          this.comboTxt.setText('');
          this._sliceEffect(item.circle.x, item.circle.y, 0xef4444);
          if (this.lives <= 0) { this._endGame(); return; }
        }
        item.circle.destroy(); item.label.destroy();
        this._checkEnd();
        return;
      }
    }
  }

  _sliceEffect(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y, 4, color);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-50, 50),
        y: y + Phaser.Math.Between(-50, 50),
        alpha: 0, scale: 0, duration: 400,
        onComplete: () => p.destroy(),
      });
    }
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

    // Build card deck: correct + wrong pairings
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

    // Header: cocktail name
    this.add.text(W / 2, 16, `${cocktail.icon} ${cocktail.name}`, {
      fontFamily: FONT, fontSize: '20px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Hints
    this.add.text(16, H / 2, t('games.swipe_left'), {
      fontFamily: FONT, fontSize: '12px', color: '#ef4444',
    }).setOrigin(0, 0.5).setAngle(-90);

    this.add.text(W - 16, H / 2, t('games.swipe_right'), {
      fontFamily: FONT, fontSize: '12px', color: '#34d399',
    }).setOrigin(1, 0.5).setAngle(90);

    // Score + progress
    this.scoreTxt = this.add.text(W / 2, 46, `${this.score} pts`, {
      fontFamily: FONT, fontSize: '14px', color: '#fff',
    }).setOrigin(0.5, 0);

    this.progressTxt = this.add.text(W / 2, H - 30, `1/${this.total}`, {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5);

    this.streakTxt = this.add.text(W / 2, 66, '', {
      fontFamily: FONT, fontSize: '14px', color: '#d4a44a',
    }).setOrigin(0.5, 0);

    this._showCard();
  }

  _showCard() {
    if (this.deckIdx >= this.deck.length) { this._endGame(); return; }

    const { width: W, height: H } = this.scale;
    const card = this.deck[this.deckIdx];
    const cardW = Math.min(W - 60, 260);
    const cardH = 160;
    const cx = W / 2, cy = H / 2;

    this.cardBg = this.add.rectangle(cx, cy, cardW, cardH, CLR.surface2, 0.95)
      .setInteractive({ draggable: true });
    this.cardBg.setStrokeStyle(2, 0x555555);
    this.cardBg._belongs = card.belongs;
    this.cardBg._origX = cx;

    this.cardLabel = this.add.text(cx, cy - 10, card.name, {
      fontFamily: FONT, fontSize: '20px', color: '#fff', fontStyle: 'bold',
      wordWrap: { width: cardW - 20 }, align: 'center',
    }).setOrigin(0.5);

    this.cardHint = this.add.text(cx, cy + 40, card.belongs ? '?' : '?', {
      fontFamily: FONT, fontSize: '13px', color: '#999',
    }).setOrigin(0.5);

    this.progressTxt.setText(`${this.deckIdx + 1}/${this.total}`);

    // Drag logic
    this.input.on('drag', this._onDrag, this);
    this.input.on('dragend', this._onDragEnd, this);
  }

  _onDrag(pointer, obj, dragX) {
    if (obj !== this.cardBg) return;
    obj.x = dragX;
    this.cardLabel.x = dragX;
    this.cardHint.x = dragX;

    const diff = dragX - obj._origX;
    obj.rotation = diff * 0.002;
    this.cardLabel.rotation = obj.rotation;

    if (diff > 40) {
      obj.setStrokeStyle(3, CLR.green);
      this.cardHint.setText('✓').setColor('#34d399');
    } else if (diff < -40) {
      obj.setStrokeStyle(3, CLR.red);
      this.cardHint.setText('✗').setColor('#ef4444');
    } else {
      obj.setStrokeStyle(2, 0x555555);
      this.cardHint.setText('?').setColor('#999');
    }
  }

  _onDragEnd(pointer, obj) {
    if (obj !== this.cardBg) return;
    const { width: W } = this.scale;
    const diff = obj.x - obj._origX;
    const threshold = W * 0.2;

    if (Math.abs(diff) > threshold) {
      const swipedRight = diff > 0;
      const isCorrect = swipedRight === obj._belongs;

      if (isCorrect) {
        this.correct++;
        this.streak++;
        this.score += 100 + Math.min(this.streak, 5) * 20;
        if (this.streak >= 3) this.streakTxt.setText(`🔥 ${t('games.streak')} x${this.streak}`);
      } else {
        this.streak = 0;
        this.streakTxt.setText('');
      }
      this.scoreTxt.setText(`${this.score} pts`);

      // Fly card off screen
      const flyX = diff > 0 ? W + 200 : -200;
      this.tweens.add({
        targets: [this.cardBg, this.cardLabel, this.cardHint],
        x: flyX, alpha: 0, duration: 250, ease: 'Power2',
        onComplete: () => {
          this._showFeedback(isCorrect);
          this.cardBg.destroy(); this.cardLabel.destroy(); this.cardHint.destroy();
          this.input.off('drag', this._onDrag, this);
          this.input.off('dragend', this._onDragEnd, this);
          this.deckIdx++;
          this.time.delayedCall(400, () => this._showCard());
        },
      });
    } else {
      // Snap back
      this.tweens.add({ targets: [this.cardBg, this.cardLabel, this.cardHint],
        x: obj._origX, rotation: 0, duration: 200, ease: 'Back',
      });
    }
  }

  _showFeedback(correct) {
    const { width: W, height: H } = this.scale;
    const fb = this.add.text(W / 2, H / 2, correct ? '✓' : '✗', {
      fontSize: '64px', color: correct ? '#34d399' : '#ef4444',
    }).setOrigin(0.5);
    this.tweens.add({ targets: fb, alpha: 0, scale: 2, duration: 500,
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
    const emoji = pct >= 0.8 ? '🏆' : pct >= 0.5 ? '👏' : '💪';
    const title = pct >= 0.8 ? t('games.great') : pct >= 0.5 ? t('games.good') : t('games.try_again');

    // Emoji
    this.add.text(W / 2, H * 0.12, emoji, { fontSize: '64px' }).setOrigin(0.5);

    // Title
    this.add.text(W / 2, H * 0.22, title, {
      fontFamily: FONT, fontSize: '26px', color: '#d4a44a', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      { label: t('games.score'), val: `${data.score}` },
      { label: t('games.correct'), val: `${data.correct}/${data.total}` },
    ];
    stats.forEach((s, i) => {
      const sy = H * 0.32 + i * 50;
      this.add.text(W / 2, sy, s.val, {
        fontFamily: FONT, fontSize: '28px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(W / 2, sy + 28, s.label, {
        fontFamily: FONT, fontSize: '13px', color: '#999',
      }).setOrigin(0.5);
    });

    // Cocktail names
    if (data.cocktailNames && data.cocktailNames.length > 0) {
      const names = [...new Set(data.cocktailNames)].join(', ');
      this.add.text(W / 2, H * 0.52, names, {
        fontFamily: FONT, fontSize: '14px', color: '#d4a44a',
        wordWrap: { width: W - 40 }, align: 'center',
      }).setOrigin(0.5);
    }

    // Feedback question
    this.add.text(W / 2, H * 0.60, t('games.feedback_q'), {
      fontFamily: FONT, fontSize: '14px', color: '#ccc',
    }).setOrigin(0.5);

    // Feedback buttons
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

    // Learn recipe
    if (data.cocktailNames && data.cocktailNames.length > 0) {
      btn(this, W / 2, btnY, btnW, 44, `📖 ${t('games.learn_recipe')}`, 0x7c3aed, () => {
        if (_onNavigate) _onNavigate('learn-recipe', data.cocktailNames[0]);
      });
    }

    // Play again
    btn(this, W / 2, btnY + 56, btnW, 44, `🔄 ${t('games.play_again')}`, CLR.surface2, () => {
      this.scene.start(data.mode === 'mixology-rush' ? 'MixologyRushScene'
        : data.mode === 'ninja-shaker' ? 'NinjaShakerScene'
        : 'CocktailTinderScene');
    });

    // Menu
    btn(this, W / 2, btnY + 112, btnW, 44, `🕹️ ${t('games.menu')}`, CLR.surface2, () => {
      this.scene.start('MenuScene');
    });

    // Home
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
