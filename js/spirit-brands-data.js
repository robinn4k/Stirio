// ─── Spirit Brands Data ────────────────────────────────────────────────
// Per-spirit-type brand entries with 8-axis flavor + aroma tasting profiles.
// Consumed by ArticleScreen (js/article.jsx) to render a "Marcas destacadas"
// section inside spirit articles (Ron, Whisky, Tequila…).
//
// Shape:
//   SPIRIT_BRANDS[spiritArticleId] = [
//     { id, name, style, producer, region (ISO-2), year, abv, aging_years,
//       cask, distillation, color (OKLCH for hero gradient),
//       flavors: { <FLAVOR_AXES>: 0..100 },
//       aromas:  { <AROMA_AXES>:  0..100 },
//       pairing: [ficha-id, …] }
//   ]
//
// Text (tasting notes, story) lives in i18n under wiki.brand.<id>.{tasting|story}.

(function () {
  const FLAVOR_AXES = ['sweet','bitter','spiced','toasted','fruity','woody','smoky','herbal'];
  const AROMA_AXES  = ['vanilla','oak','caramel','spice','driedFruit','citrus','tobacco','cocoa'];

  const SPIRIT_BRANDS = {
    rum: [
      {
        id: 'barcelo-anejo',
        name: 'Ron Barceló Añejo',
        style: 'anejo',
        producer: 'Casa Barceló',
        region: 'do',
        year: 1930,
        abv: 37.5,
        aging_years: 4,
        cask: 'roble-americano',
        distillation: 'columna',
        color: 'oklch(0.45 0.09 55)',
        flavors: { sweet: 75, bitter: 20, spiced: 55, toasted: 70, fruity: 60, woody: 65, smoky: 25, herbal: 15 },
        aromas:  { vanilla: 80, oak: 70, caramel: 75, spice: 50, driedFruit: 55, citrus: 30, tobacco: 35, cocoa: 45 },
        pairing: ['cuba-libre', 'daiquiri', 'mai-tai', 'mojito'],
      },
    ],
  };

  Object.assign(window, { SPIRIT_BRANDS, FLAVOR_AXES, AROMA_AXES });
})();
