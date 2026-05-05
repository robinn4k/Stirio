# Vintage Cocktail Books → stirio

Pipeline para convertir 378 libros de coctelería vintage (1700s–1960s) en JSON estructurado bilingüe (idioma original + traducción al español), listo para alimentar la enciclopedia de cócteles **stirio**.

## Estado

| Etapa | Hecho | Faltan | Total |
|---|---|---|---|
| PDFs originales | 378 | — | 378 |
| .txt extraídos con pdftotext | 364 | 14 (necesitan re-OCR con Tesseract) | 378 |
| .json estructurados | 29 | 349 | 378 |

## Estructura

```
vintage-cocktail-books-euvs/
├── *.pdf                    PDFs originales con OCR embebido bueno
├── txt/*.txt                Texto extraído con pdftotext
├── json/                    Output estructurado por libro
│   └── _SCHEMA.md           Esquema canónico
├── needs-reocr/             Los 14 PDFs cuyo OCR embebido está vacío
│   ├── *.pdf
│   └── txt/*.txt            (los .txt originales, todos casi vacíos)
├── PROMPT_CLAUDE_CODE.md    Prompt autocontenido para continuar el procesamiento
└── README.md                Este archivo
```

## Cómo continuar el procesamiento

Lee `PROMPT_CLAUDE_CODE.md` y pásalo a Claude Code. Es autocontenido: explica el schema, la cola de pendientes, el patrón de subagentes en paralelo, y cómo re-OCR los 14 problemáticos con Tesseract.

## Schema

El esquema completo está en [`json/_SCHEMA.md`](json/_SCHEMA.md). Resumen:

- **metadata**: title, author, year, language, publisher, city, edition, source_file, notes
- **sections**: array ordenado de bloques narrativos (front_matter, preface, history, explanation, recipes_section, advertisement, appendix, index, other) con `content_original` + `content_es`
- **recipes**: array de recetas con `name_original` / `name_es`, `category`, `ingredients[]` (cada uno con item/amount/unit), `method_original` / `method_es`, `glassware`, `garnish`, `page_reference`, `raw_text`

## Fuente

Colección [Vintage Cocktail Books — EUVS](https://archive.org/details/vintage-cocktail-books-euvs) (Exposition Universelle des Vins et Spiritueux, dominio público).
