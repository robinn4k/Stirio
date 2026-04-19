// Stirio — Per-cocktail photo URLs for FichasScreen grid & detail hero.
// Fichas whose name isn't in this map fall back to the gradient+emoji tile
// (existing behaviour). Covers a curated subset of iconic cocktails.
//
// Curation rule: each Unsplash photo ID must appear at most once. If two
// cocktails look very different (e.g. Negroni vs Americano, Daiquiri vs
// Boulevardier), only the one that the photo actually shows keeps the entry;
// the other falls back to the emoji tile rather than lying about the drink.
// Expanding coverage requires manually verifying each new Unsplash shot.
//
// Exposed via IIFE so classic <script> consumers (reference.jsx) can read it.

(() => {
  const U = (id) => `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`;
  window.FICHA_IMAGES = {
    'Negroni':          U('photo-1556855810-ac404aa91e85'),
    'Dry Martini':      U('photo-1575023782549-62ca0d244b39'),
    'Margarita':        U('photo-1541546006121-5c3bc5e8c7b9'),
    'Mojito':           U('photo-1551538827-9c037cb4f32a'),
    'Daiquiri':         U('photo-1514362453360-8cb44e31dabf'),
    'Old Fashioned':    U('photo-1527661591475-527312dd65f5'),
    'Whiskey Sour':     U('photo-1599098915050-28f5f5ffdf73'),
    'Cosmopolitan':     U('photo-1569529465841-dfecdab7503b'),
    'Espresso Martini': U('photo-1545438102-799c3991ffb2'),
    'Aperol Spritz':    U('photo-1536935338788-846bb9981813'),
    'Piña Colada':      U('photo-1587223962930-cb7f31384c19'),
    'Caipirinha':       U('photo-1580492432853-be97a2020ba4'),
    'Bloody Mary':      U('photo-1582554502323-ec9e28bb38b4'),
    'Gin Fizz':         U('photo-1544145945-f90425340c7e'),
    'Gin Tonic':        U('photo-1558642452-9d2a7deb7f62'),
    'Sidecar':          U('photo-1551024709-8f23befc6f87'),
    'Aviation':         U('photo-1587058876311-90f65c3b16e4'),
    'White Russian':    U('photo-1551024506-0bccd828d307'),
    'French 75':        U('photo-1541807360746-039050215694'),
    'Mint Julep':       U('photo-1541545554-81e6aedbecc5'),
    // Cocktails whose previous entry reused another drink's photo ID
    // (Manhattan/Boulevardier shared Daiquiri; Tom Collins/John Collins/Pisco
    // Sour shared Gin Fizz; Gimlet/Martinez/Clover Club/Last Word/Americano/
    // Mai Tai/Paloma/Alexander/Sazerac all collided) are intentionally
    // omitted until a verified photo is curated. They render the gradient
    // emoji fallback, which is preferable to a misleading hero image.
  };
  window.getFichaImage = (name) => (window.FICHA_IMAGES && window.FICHA_IMAGES[name]) || null;
})();
