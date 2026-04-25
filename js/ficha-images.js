// Stirio — Per-cocktail photo URLs for FichasScreen grid & detail hero.
//
// The previous version mapped ~20 cocktails to curated Unsplash photo IDs,
// but in practice many photos didn't actually show the named drink (the
// Cosmopolitan ID resolved to a Johnnie Walker bottle, etc.) — Unsplash
// photo metadata can drift, and we never had a programmatic way to verify
// the visual content. Showing a wrong drink is worse than showing none.
//
// We now return null for every name. FichasScreen and the FichaDetail hero
// both fall back to the gradient + emoji tile, which is honest and looks
// clean on every theme.
//
// Re-introducing per-cocktail photos should mean using a self-hosted asset
// directory (e.g. img/fichas/<slug>.jpg) so we control what each card shows.
// Exposed via IIFE so classic <script> consumers (reference.jsx) can read it.

(() => {
  window.FICHA_IMAGES = {};
  window.getFichaImage = () => null;
})();
