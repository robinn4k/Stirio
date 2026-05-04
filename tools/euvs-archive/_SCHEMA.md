# Schema de libros stirio (v1)

Cada libro produce **un .json** con 3 bloques: `metadata`, `sections`, `recipes`.

## Estructura general

```jsonc
{
  "book_id": "string slug, ej: '1862-jerry-thomas-bartenders-guide'",
  "metadata": {
    "title": "Título completo según portada",
    "author": "Autor (o null si anónimo)",
    "year": 1862,
    "language": "ISO 639-1: 'en' | 'es' | 'fr' | 'it' | 'de' | 'la' | 'mixed'",
    "language_name": "Nombre legible en español",
    "publisher": "Editorial o null",
    "city": "Ciudad de publicación o null",
    "edition": "Texto edición o null",
    "source_file": "Nombre exacto del .txt original",
    "notes": "Notas relevantes (1-3 frases en español)"
  },
  "sections": [
    {
      "order": 1,
      "type": "front_matter | preface | introduction | history | explanation | recipes_section | appendix | index | advertisement | other",
      "title": "Título tal como aparece (o sintetizado)",
      "title_es": "Traducción al español si aplica",
      "content_original": "Texto original limpio (sin OCR garbage). Para 'recipes_section' este campo puede ser null y el contenido va en recipes[].",
      "content_es": "Traducción al español. Si el original ya es español, repetir."
    }
  ],
  "recipes": [
    {
      "id": "<book_id>-<index zero-padded a 3 digitos>",
      "order": 1,
      "section_title": "Sección donde aparece (ej: 'Punches')",
      "category": "cocktail | punch | cobbler | cup | julep | sour | fizz | flip | toddy | sangaree | smash | sling | crusta | sangría | other",
      "name_original": "Nombre tal como aparece en el libro",
      "name_es": "Traducción al español si aplica (o el mismo si ya es español)",
      "yield": "Ej: '1 vaso grande de bar', '20 personas', null",
      "ingredients": [
        {
          "item_original": "Nombre del ingrediente en idioma original (ej: 'Boker's bitters')",
          "item_es": "Nombre normalizado en español (ej: 'amargo de Boker')",
          "amount": "1 | 0.5 | '1-2' | null",
          "unit": "ml | oz | dash | wine-glass | tablespoon | teaspoon | piece | slice | gallon | quart | gill | null",
          "notes": "Detalles extras o null"
        }
      ],
      "method_original": "Método tal como aparece, limpio de errores OCR",
      "method_es": "Método traducido al español",
      "glassware": "Tipo de vaso/copa tal como menciona, o null",
      "garnish": "Decoración/guarnición o null",
      "page_reference": null,
      "raw_text": "Bloque ENTERO original de la receta (nombre + ingredientes + método), útil para auditoría"
    }
  ]
}
```

## Reglas de procesamiento

1. **Limpieza OCR**: arreglar errores obvios (`ho` → `the`, `tho` → `the`, espacios raros, palabras partidas). Mantener fidelidad al texto original.
2. **Saltar basura**: catálogos del editor, anuncios de libros no relacionados, listas de precios → `type: "advertisement"` con `content_original` resumido o vacío.
3. **Idioma**: detectar el idioma principal y guardarlo. Si el libro mezcla, marcar `mixed` y por receta indicar el idioma del nombre.
4. **Traducción al español**: TODO el contenido (nombres, secciones, instrucciones) tiene su versión `_es`. Si el original ya es español, copiar tal cual al campo `_es`.
5. **Categoría de receta**: inferir del título o sección. `cocktail` por defecto si no está claro.
6. **Ingredientes**: separar cantidad / unidad / item siempre que sea posible. Si la línea es ambigua, dejar `amount: null, unit: null` y poner todo en `item_original`.
7. **Orden**: respetar el orden del libro. `sections[].order` y `recipes[].order` son secuenciales empezando en 1.
