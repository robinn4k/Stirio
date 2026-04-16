// Data module: cocktails for Ninja Shaker.
// Simplified subset of the original Stirio cocktail data so the PoC is
// self-contained. Replace with a shared import once the whole app is on R3F.

export const COCKTAILS = [
  {
    name: 'Negroni',
    icon: '🍹',
    ingredients: ['Gin', 'Campari', 'Vermouth Rosso'],
  },
  {
    name: 'Old Fashioned',
    icon: '🥃',
    ingredients: ['Bourbon', 'Angostura', 'Sugar', 'Orange peel'],
  },
  {
    name: 'Margarita',
    icon: '🍸',
    ingredients: ['Tequila', 'Triple Sec', 'Lime juice'],
  },
  {
    name: 'Daiquiri',
    icon: '🍹',
    ingredients: ['White Rum', 'Lime juice', 'Sugar'],
  },
  {
    name: 'Espresso Martini',
    icon: '☕',
    ingredients: ['Vodka', 'Coffee liqueur', 'Espresso', 'Sugar'],
  },
];

const DISTRACTORS = [
  'Cognac', 'Mezcal', 'Aperol', 'Prosecco', 'Mint', 'Cucumber',
  'Ginger beer', 'Pineapple juice', 'Cream', 'Soda', 'Grenadine',
  'Maraschino', 'Bitters', 'Egg white',
];

const EMOJI = {
  Gin: '🫐', Campari: '🍒', 'Vermouth Rosso': '🍷',
  Bourbon: '🥃', Angostura: '🧪', Sugar: '🍚', 'Orange peel': '🍊',
  Tequila: '🌵', 'Triple Sec': '🍊', 'Lime juice': '🟢',
  'White Rum': '🥥', Vodka: '❄️', 'Coffee liqueur': '☕',
  Espresso: '☕',
  Cognac: '🍇', Mezcal: '🌵', Aperol: '🟠', Prosecco: '🥂',
  Mint: '🌿', Cucumber: '🥒', 'Ginger beer': '🫚', 'Pineapple juice': '🍍',
  Cream: '🥛', Soda: '💧', Grenadine: '🌺', Maraschino: '🍒',
  Bitters: '🧪', 'Egg white': '🥚',
};

export function getIngredientEmoji(name) {
  return EMOJI[name] ?? '🧪';
}

export function getDistractors(cocktail, n = 10) {
  const pool = DISTRACTORS.filter(d => !cocktail.ingredients.includes(d));
  return shuffle(pool).slice(0, n);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
