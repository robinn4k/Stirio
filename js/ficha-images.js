// Stirio — Per-cocktail photo URLs for FichasScreen grid & detail hero.
//
// Sourced from IBA World's official cocktail catalog
// (https://iba-world.com/cocktails/all-cocktails/), which publishes a curated
// photo per IBA-recognized drink. Each URL is the canonical IBA WebP asset,
// so the visual always matches the drink name.
//
// Cocktails not on the IBA list (or whose IBA photo is not yet available)
// keep returning null — FichasScreen and FichaDetail then show the gradient
// + emoji fallback tile, which renders cleanly on every theme.
// Exposed via IIFE so classic <script> consumers (reference.jsx) can read it.

(() => {
  const BASE = 'https://iba-world.com/wp-content/uploads/2024/07/';
  const U = (slug) => `${BASE}${slug}.webp`;

  window.FICHA_IMAGES = {
    // The Unforgettables
    'Alexander':              U('iba-cocktail-the-unforgettables-alexander-669491364f7f2'),
    'Americano':              U('iba-cocktail-the-unforgettables-americano-669490fe3cb42'),
    'Angel Face':             U('iba-cocktail-the-unforgettables-angel-face-669490fe6df67'),
    'Aviation':               U('iba-cocktail-the-unforgettables-aviation-66949102296a4'),
    'Between the Sheets':     U('iba-cocktail-the-unforgettables-between-the-sheets-669491023d7af'),
    'Boulevardier':           U('iba-cocktail-the-unforgettables-boulevardier-6694910552acd'),
    'Brandy Crusta':          U('iba-cocktail-the-unforgettables-brandy-crusta-6694910571bcb'),
    'Casino':                 U('iba-cocktail-the-unforgettables-casino-6694910882cd6'),
    'Clover Club':            U('iba-cocktail-the-unforgettables-clover-club-66949108a3e54'),
    'Daiquiri':               U('iba-cocktail-the-unforgettables-daiquiri-6694910c5866e'),
    'Dry Martini':            U('iba-cocktail-the-unforgettables-dry-martini-6694910fb500c'),
    'Gin Fizz':               U('iba-cocktail-the-unforgettables-gin-fizz-6694910fc2eab'),
    'Hanky Panky':            U('iba-cocktail-the-unforgettables-hanky-panky-66949112edbf5'),
    'John Collins':           U('iba-cocktail-the-unforgettables-john-collins-669491130ef87'),
    'Last Word':              U('iba-cocktail-the-unforgettables-last-word-6694911607ddf'),
    'Manhattan':              U('iba-cocktail-the-unforgettables-manhattan-6694911627de7'),
    'Martinez':               U('iba-cocktail-the-unforgettables-martinez-6694911927849'),
    'Mary Pickford':          U('iba-cocktail-the-unforgettables-mary-pickford-6694911933ea7'),
    'Monkey Gland':           U('iba-cocktail-the-unforgettables-monkey-gland-6694911cbf5a2'),
    'Negroni':                U('iba-cocktail-the-unforgettables-negroni-6694911cc3b65'),
    'Old Fashioned':          U('iba-cocktail-the-unforgettables-old-fashioned-6694911fce360'),
    'Paradise':               U('iba-cocktail-the-unforgettables-paradise-6694911fdbd4b'),
    "Planter's Punch":        U('iba-cocktail-the-unforgettables-planters-punch-66949122d41fb'),
    'Porto Flip':             U('iba-cocktail-the-unforgettables-porto-flip-669491230cea4'),
    'Ramos Fizz':             U('iba-cocktail-the-unforgettables-ramos-fizz-669491260ca6c'),
    'Remember the Maine':     U('iba-cocktail-the-unforgettables-remember-the-main-6694912622959'),
    'Rusty Nail':             U('iba-cocktail-the-unforgettables-rusty-nail-66949129acfd1'),
    'Sazerac':                U('iba-cocktail-the-unforgettables-sazerac-66949129b50d1'),
    'Sidecar':                U('iba-cocktail-the-unforgettables-sidecar-6694912cb8aa9'),
    'Stinger':                U('iba-cocktail-the-unforgettables-stinger-6694912ce0b8d'),
    'Tuxedo':                 U('iba-cocktail-the-unforgettables-tuxedo-6694912fd3b8f'),
    'Vieux Carré':            U('iba-cocktail-the-unforgettables-vieux-carre-6694913015248'),
    'Whiskey Sour':           U('iba-cocktail-the-unforgettables-whiskey-sour-66949132e6ae9'),
    'White Lady':             U('iba-cocktail-the-unforgettables-white-lady-6694913318105'),

    // Contemporary Classics
    'Bellini':                U('iba-cocktail-contemporary-classics-bellini-6695cda4217da'),
    'Black Russian':          U('iba-cocktail-contemporary-classics-black-russian-6695cda4183dc'),
    'Bloody Mary':            U('iba-cocktail-contemporary-classics-bloody-mary-6695cda72fe0f'),
    'Caipirinha':             U('iba-cocktail-contemporary-classics-caipirinha-6695cda74b13a'),
    'Champagne Cocktail':     U('iba-cocktail-contemporary-classics-champagne-cocktail-6695cdaa71bb2'),
    'Corpse Reviver #2':      U('iba-cocktail-contemporary-classics-corpse-reviver-2-6695cdad6da15'),
    'Cosmopolitan':           U('iba-cocktail-contemporary-classics-cosmopolitan-6695cdae389dc'),
    'Cuba Libre':             U('iba-cocktail-contemporary-classics-cuba-libre-6695cdb0a6f80'),
    'French 75':              U('iba-cocktail-contemporary-classics-french-75-6695cdb175e06'),
    'French Connection':      U('iba-cocktail-contemporary-classics-french-connection-6695cdb3cc15f'),
    'Garibaldi':              U('iba-cocktail-contemporary-classics-garibaldi-6695cdb4cbf81'),
    'Grasshopper':            U('iba-cocktail-contemporary-classics-grasshopper-6695cdb737498'),
    'Hemingway Special':      U('iba-cocktail-contemporary-classics-hemingway-special-6695cdb814e5a'),
    "Horse's Neck":           U('iba-cocktail-contemporary-classics-horses-neck-6695cdba5fadc'),
    'Irish Coffee':           U('iba-cocktail-contemporary-classics-irish-coffee-copy-6695cdbb430cd'),
    'Kir':                    U('iba-cocktail-contemporary-classics-kir-6695cdbdbb2e1'),
    'Lemon Drop':             U('iba-cocktail-contemporary-classics-lemon-drop-martini-6695cdbe3eed7'),
    'Long Island Iced Tea':   U('iba-cocktail-contemporary-classics-long-island-iced-tea-6695cdc10c463'),
    'Mai Tai':                U('iba-cocktail-contemporary-classics-mai-tai-6695cdc169ea3'),
    'Margarita':              U('iba-cocktail-contemporary-classics-margarita-6695cdd7505e0'),
    'Mimosa':                 U('iba-cocktail-contemporary-classics-mimosa-6695cdc4463c9'),
    'Mint Julep':             U('iba-cocktail-contemporary-classics-mint-julep-6695cdc4aa398'),
    'Mojito':                 U('iba-cocktail-contemporary-classics-mojito-6695cdc755626'),
    'Moscow Mule':            U('iba-cocktail-contemporary-classics-moscow-mule-6695cdc7d8cb2'),
    'Piña Colada':            U('iba-cocktail-contemporary-classics-pina-colada-6695cdcabbf00'),
    'Pisco Sour':             U('iba-cocktail-contemporary-classics-pisco-sour-6695cdcaf1122'),
    'Sea Breeze':             U('iba-cocktail-contemporary-classics-sea-breeze-6695cdce015a8'),
    'Sex on the Beach':       U('iba-cocktail-contemporary-classics-sex-on-the-beach-6695cdd0aecf3'),
    'Singapore Sling':        U('iba-cocktail-contemporary-classics-singapore-sling-6695cdd136426'),
    'Tequila Sunrise':        U('iba-cocktail-contemporary-classics-tequila-sunrise-6695cdd3da10a'),
    'Vesper':                 U('iba-cocktail-contemporary-classics-vesper-6695cdd43284b'),
    'Zombie':                 U('iba-cocktail-contemporary-classics-zombie-6695cdd6cef05'),

    // New Era
    "Bee's Knees":             U('iba-cocktail-new-era-bees-knees-6695d397e26c1'),
    'Bramble':                 U('iba-cocktail-new-era-bramble-6695d398036e1'),
    'Canchanchara':            U('iba-cocktail-new-era-canchanchara-6695d39b24d7e'),
    'Chartreuse Swizzle':      U('iba-cocktail-new-era-chartreuse-swizzle-6695d39b326e0'),
    "Dark 'n' Stormy":         U('iba-cocktail-new-era-dark-n-stormy-6695d39e2bd94'),
    'Espresso Martini':        U('iba-cocktail-new-era-espresso-martini-6695d3a172fd3'),
    'Fernandito':              U('iba-cocktail-new-era-fernandito-6695d3a1a3586'),
    'French Martini':          U('iba-cocktail-new-era-french-martini-6695d3a4acf5f'),
    'Illegal':                 U('iba-cocktail-new-era-illegal-6695d3a7de51f'),
    "Missionary's Downfall":   U('iba-cocktail-new-era-missionarys-downfall-6695d3ab4d4c5'),
    'Naked and Famous':        U('iba-cocktail-new-era-naked-and-famous-6695d3ae8e1dc'),
    'New York Sour':           U('iba-cocktail-new-era-new-york-sour-6695d3ae88cd2'),
    'Old Cuban':               U('iba-cocktail-new-era-old-cuban-6695d3b18c692'),
    'Paloma':                  U('iba-cocktail-new-era-paloma-6695d3b19cda4'),
    'Paper Plane':             U('iba-cocktail-new-era-paper-plane-6695d3b4745eb'),
    'Penicillin':              U('iba-cocktail-new-era-penicillin-6695d3b47b79f'),
    'Pisco Punch':             U('iba-cocktail-new-era-pisco-punch-6695d3b74b9f5'),
    'Russian Spring Punch':    U('iba-cocktail-new-era-russian-spring-punch-6695d3ba314f1'),
    'Sherry Cobbler':          U('iba-cocktail-new-era-sherry-cobbler-6695d3ba8bdb7'),
    'Southside':               U('iba-cocktail-new-era-south-side-6695d3bdcc9fe'),
    'Spicy Fifty':             U('iba-cocktail-new-era-spicy-fifty-6695d3bdd14b1'),
    'Spritz':                  U('iba-cocktail-new-era-spritz-6695d3c0f113f'),
    'Suffering Bastard':       U('iba-cocktail-new-era-suffering-bastard-6695d3c1081c4'),
    'Three Dots and a Dash':   U('iba-cocktail-new-era-three-dots-and-a-dash-6695d3c3e2d24'),
    'Tipperary':               U('iba-cocktail-new-era-tipperary-6695d3c453fd3'),
    "Tommy's Margarita":       U('iba-cocktail-new-era-tommys-margarita-6695d3c7171ef'),
    'Trinidad Sour':           U('iba-cocktail-new-era-trinidad-sour-6695d3c794a43'),
    'Ve.N.To':                 U('iba-cocktail-new-era-vento-6695d3ca45bc2'),
    'Jungle Bird':             U('iba-cocktail-new-era-jungle-bird-6695d3ab45a87'),
  };

  window.getFichaImage = (name) => window.FICHA_IMAGES[name] || null;
})();
