# EUVS Archive — herramientas dev

Herramientas dev-only para mantener la biblioteca **EUVS Vintage Cocktail
Books** que la app sirve desde `data/euvs-books/`.

Estos scripts **no forman parte del bundle de la app** ni del Service Worker.
Se ejecutan manualmente; los PDFs originales nunca se commitean al repo.

## Estructura

```
tools/euvs-archive/
├── README.md             # este archivo
├── _SCHEMA.md            # schema de los ficheros data/euvs-books/<id>.json
├── PENDING.md            # backlog y estado de cada libro
├── requirements.txt
├── pyproject.toml
├── download_euvs.py      # baja PDFs originales desde Internet Archive (opcional)
├── extract_skeleton.py   # OCR .txt → skeleton heurístico de candidatos
├── auto_enrich.py        # skeleton → patches por receta (EN / ES / FR)
├── finalize_book.py      # skeleton + patches → libro final en data/euvs-books/
├── build_catalog.py      # genera data/euvs-catalog.json
├── build_pending.py      # lista candidatos pendientes
├── ocr_all_pdfs.sh       # batch tesseract OCR para PDFs sin .txt
├── reocr_book.sh         # re-OCR de un libro con OCRmyPDF
└── data/                 # gitignored
    ├── downloads/        # PDFs originales (decenas de GB, no commitear)
    ├── skeletons/        # output de extract_skeleton.py (intermediate)
    ├── enrichments/      # output de auto_enrich.py (intermediate)
    └── logs/
```

Los **datos de los libros** (clasificados, traducidos al español, schema en
`_SCHEMA.md`) viven en `data/euvs-books/<book_id>.json` y sí se commitean.
Los PDFs originales **no**.

## Aviso legal

Este módulo proporciona herramientas para descargar libros de la colección
EUVS desde Internet Archive. **No redistribuye PDFs** — los PDFs no se
incluyen en el repositorio. El catálogo (`data/euvs-catalog.json`) y los
ficheros de libros (`data/euvs-books/*.json`) contienen únicamente texto
extraído y metadatos.

El estatus de derechos de autor varía por país: la mayoría de obras anteriores
a 1929 están en dominio público en EE. UU., pero en la UE la regla general es
**vida del autor + 70 años**. Verifica el estatus legal en tu jurisdicción
antes de cualquier uso comercial.

## Requisitos

- Python ≥ 3.9
- (Solo para `download_euvs.py`) Conexión a Internet

## Instalación

```bash
cd tools/euvs-archive
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

## Uso

### Regenerar el catálogo

`data/euvs-catalog.json` es un índice ligero derivado de los ficheros en
`data/euvs-books/`. Se regenera con:

```bash
python build_catalog.py
```

Esto sobrescribe `data/euvs-catalog.json` con una entrada por cada libro,
ordenada por año. Hazlo cada vez que añadas, borres o cambies un libro.

| Flag | Default | Descripción |
|---|---|---|
| `--out PATH`        | `../../data/euvs-catalog.json` | ruta del catálogo de salida |
| `--books-dir PATH`  | `../../data/euvs-books`        | carpeta con los libros |

El test `tests/euvs-archive.test.js` verifica que el catálogo committeado
coincida con los ficheros de libros (drift detector).

### Añadir un libro nuevo

#### Opción A — Pipeline skeleton-first (recomendado para libros nuevos)

```bash
# 1. Extraer candidatos heurísticos del .txt OCR'd
python extract_skeleton.py "<year>-<slug>"
# Genera data/skeletons/<slug>.skeleton.json

# 2. Auto-enriquecer recetas (parsers por idioma)
python auto_enrich.py <slug> --lang en                      # libro inglés
python auto_enrich.py <slug> --lang en --skip-mixed-case    # idem, salta mixed-case como fragmento
python auto_enrich.py <slug> --lang es                      # libro español
python auto_enrich.py <slug> --lang fr                      # libro francés
# Genera data/enrichments/<slug>/recipes/*.json

# 3. (Opcional) Edita manualmente los patches problemáticos
#    e.g. arregla nombres con OCR dañado en data/enrichments/<slug>/recipes/NNN.json

# 4. Escribe meta + sections del libro
#    data/enrichments/<slug>/meta.json (autor, año, idioma, notas)
#    data/enrichments/<slug>/sections.json (front_matter + recipes_section)

# 5. Trim del skeleton (las N secciones espurias del heurístico → 2 limpias)

# 6. Finalizar y promover el libro
python finalize_book.py <slug>             # writes data/euvs-books/<slug>.json
python build_catalog.py                    # regenerates the catalog
```

Para más detalle del flujo, ver `PENDING.md` (backlog) y los commits
"Add YEAR Title + bump app to vX.YZ" en main.

**Idiomas soportados por `auto_enrich.py`:**

| Lang | Pattern típico | Ejemplos validados |
|------|---|---|
| `en` | "AMOUNT UNIT NAME" + métodos shake/stir | Ensslin 1917, NY Hand-Book 1895, Hotel Martinique 1938, Here's How 1930, Cocktail Hour 1938 |
| `es` | "NOMBRE: ing - ing - ing - método - copa" | El Barman Práctico 1950 (Buenos Aires), Sloppy Joe's 1938 |
| `fr` | "1/3 ingrediente / N traits / jus de" | Pillaert 1935 |

Para cada idioma, el parser normaliza fracciones OCR (`¥%`, `Y%`, `Va`,
`1/3`…) a Unicode (`½`, `¾`, `⅓`…), traduce ingredientes principales al
español vía un diccionario integrado, e infiere `category`,
`glassware`, `garnish` y `method_es` cuando es posible.

#### Opción B — Manual

1. Crea `data/euvs-books/<year>-<slug>.json` siguiendo el schema en
   `_SCHEMA.md`. El `book_id` interno **debe coincidir** con el nombre
   del fichero (sin `.json`).
2. Ejecuta `python build_catalog.py` para regenerar el catálogo.
3. Ejecuta `npm test -- euvs-archive` para verificar.

#### Versión bump (común)

Tras añadir un libro:
- Bump `STATIC_CACHE_VERSION` en `sw.js` + `version.json` + `index.html`
  (mismo patch number en los tres) para que los clientes recojan el cambio.

### (Opcional) Descargar PDFs originales

Útil si necesitas el PDF de un libro para extraer texto manualmente o para
auditar contra el original.

```bash
python download_euvs.py --year-from 1860 --year-to 1929 --max-items 20
```

| Flag | Default | Descripción |
|---|---|---|
| `--year-from N` | none | filtra a items publicados en o después del año N |
| `--year-to N`   | none | filtra a items publicados en o antes del año N |
| `--language L`  | none | código de idioma (`eng`, `fra`, `spa`, …) |
| `--max-items N` | none | corta tras N items |
| `--dry-run`     | off  | lista los items que descargaría, sin bajar nada |
| `--yes`         | off  | salta el prompt de confirmación si la descarga estimada > 50 GB |

Salida:

- PDFs en `data/downloads/{decade}/{year}_{slug}/<file>.pdf` (gitignored)
- Log en `data/logs/download.log`

La descarga es **reanudable**: si vuelves a correr el script, omite los PDFs
cuyo tamaño en disco coincide con el tamaño remoto.

## Integración con la app

`js/euvs-archive.jsx` hace `fetch('data/euvs-catalog.json')` al abrirse y
muestra una grid de libros. Tap en un libro abre `BookDetailScreen`, que
hace `fetch(entry.bookFile)` para cargar el contenido completo (sections
con `content_es` / `content_original` y un toggle ES/Original).

El Service Worker precachea solo el JS (`euvs-archive.jsx`,
`euvs-archive-utils.js`); el catálogo y los libros se cachean al vuelo
(estrategia runtime cache, no precache — ver `sw.js` comentarios).
