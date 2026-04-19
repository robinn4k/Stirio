// Stirio — Per-cocktail photo URLs for FichasScreen grid & detail hero.
// Fichas whose name isn't in this map fall back to the gradient+emoji tile
// (existing behaviour). Covers the ~30 most iconic IBA cocktails.
// Exposed via IIFE so classic <script> consumers (reference.jsx) can read it.

(() => {
  const U = (id) => `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`;
  window.FICHA_IMAGES = {
    'Negroni':          U('photo-1556855810-ac404aa91e85'),
    'Dry Martini':      U('photo-1575023782549-62ca0d244b39'),
    'Margarita':        U('photo-1541546006121-5c3bc5e8c7b9'),
    'Mojito':           U('photo-1551538827-9c037cb4f32a'),
    'Daiquiri':         U('photo-1514362453360-8cb44e31dabf'),
    'Manhattan':        U('photo-1514362545857-3bc16c4c7d1b'),
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
    'Boulevardier':     U('photo-1514362453360-8cb44e31dabf'),
    'French 75':        U('photo-1541807360746-039050215694'),
    'Gimlet':           U('photo-1558642452-9d2a7deb7f62'),
    'Tom Collins':      U('photo-1544145945-f90425340c7e'),
    'John Collins':     U('photo-1544145945-f90425340c7e'),
    'Mint Julep':       U('photo-1541545554-81e6aedbecc5'),
    'Paloma':           U('photo-1541546006121-5c3bc5e8c7b9'),
    'Sazerac':          U('photo-1527661591475-527312dd65f5'),
    'Americano':        U('photo-1556855810-ac404aa91e85'),
    'Clover Club':      U('photo-1587058876311-90f65c3b16e4'),
    'Mai Tai':          U('photo-1587223962930-cb7f31384c19'),
    'Pisco Sour':       U('photo-1544145945-f90425340c7e'),
    'Alexander':        U('photo-1551024506-0bccd828d307'),
    'Last Word':        U('photo-1587058876311-90f65c3b16e4'),
    'Martinez':         U('photo-1575023782549-62ca0d244b39'),
  };
  window.getFichaImage = (name) => (window.FICHA_IMAGES && window.FICHA_IMAGES[name]) || null;
})();
