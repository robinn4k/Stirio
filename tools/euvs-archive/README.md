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
├── requirements.txt
├── pyproject.toml
├── download_euvs.py      # baja PDFs originales desde Internet Archive (opcional)
├── build_catalog.py      # genera data/euvs-catalog.json desde data/euvs-books/
└── data/                 # gitignored
    ├── downloads/        # PDFs descargados (decenas de GB, no commitear)
    └── logs/
        └── download.log
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

1. Crea `data/euvs-books/<year>-<slug>.json` siguiendo el schema en
   `_SCHEMA.md`. El `book_id` interno **debe coincidir** con el nombre
   del fichero (sin `.json`).
2. Ejecuta `python build_catalog.py` para regenerar el catálogo.
3. Ejecuta `npm test -- euvs-archive` para verificar.
4. Bump `STATIC_CACHE_VERSION` en `sw.js` + `version.json` + `index.html`
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
