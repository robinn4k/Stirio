# EUVS Archive — descarga y catálogo

Herramientas dev-only para descargar y catalogar la colección **EUVS Vintage
Cocktail Books** alojada en Internet Archive
(https://archive.org/details/vintage-cocktail-books-euvs).

Estos scripts **no forman parte del bundle de la app** ni del Service Worker.
Se ejecutan manualmente en local; los PDFs descargados nunca se commitean al
repositorio.

## Aviso legal

Este módulo proporciona herramientas para descargar libros de la colección
EUVS desde Internet Archive. **No redistribuye contenido** — los PDFs no se
incluyen en el repositorio. El catálogo (`data/euvs-catalog.json`) contiene
únicamente metadatos públicos.

El estatus de derechos de autor varía por país: la mayoría de obras anteriores
a 1929 están en dominio público en EE. UU., pero en la UE la regla general es
**vida del autor + 70 años**. Verifica el estatus legal en tu jurisdicción
antes de cualquier uso comercial.

## Requisitos

- Python ≥ 3.9
- Conexión a Internet (los scripts hacen `archive.org`)

## Instalación

```bash
cd tools/euvs-archive
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

## Uso

### 1. Descargar PDFs

```bash
python download_euvs.py --year-from 1860 --year-to 1929 --max-items 20
```

Argumentos:

| Flag | Default | Descripción |
|---|---|---|
| `--year-from N` | none | filtra a items publicados en o después del año N |
| `--year-to N`   | none | filtra a items publicados en o antes del año N |
| `--language L`  | none | código de idioma (`eng`, `fra`, `spa`, …) |
| `--max-items N` | none | corta tras N items |
| `--dry-run`     | off  | lista los items que descargaría, sin bajar nada |
| `--yes`         | off  | salta el prompt de confirmación si la descarga estimada > 50 GB |

Salida:

- PDFs en `data/downloads/{decade}/{year}_{slug}/<file>.pdf`
- Log en `data/logs/download.log`

La descarga es **reanudable**: si vuelves a correr el script, omite los PDFs
cuyo tamaño en disco coincide con el tamaño remoto.

### 2. (Re)generar el catálogo

> **Importante**: el repo se distribuye con `data/euvs-catalog.json` **vacío**
> (`[]`). Es responsabilidad del mantenedor regenerarlo desde Internet
> Archive — el script de abajo es la única fuente de verdad. No se
> incluye un seed manual porque verificar a mano centenares de identifiers
> de archive.org es propenso a errores y producir enlaces rotos en la app
> es peor que una pantalla vacía.

```bash
python build_catalog.py
```

Esto sobrescribe `<repo>/data/euvs-catalog.json` con el catálogo completo
ordenado por año. Ese fichero **sí se commitea** (es metadata pública,
ligera, y la app web lo lee directamente).

Argumentos:

| Flag | Default | Descripción |
|---|---|---|
| `--out PATH` | `../../data/euvs-catalog.json` | ruta del JSON de salida |
| `--limit N`  | none                            | corta tras N items (útil para pruebas) |

Para cada item, el script consulta los metadatos públicos de Internet
Archive (`internetarchive.search_items`) y rellena `localPath` solo si el
PDF correspondiente ya existe en `data/downloads/`.

## Estructura del módulo

```
tools/euvs-archive/
├── README.md             # este archivo
├── requirements.txt
├── pyproject.toml
├── download_euvs.py
├── build_catalog.py
└── data/                 # gitignored
    ├── downloads/        # PDFs descargados (decenas de GB, no commitear)
    └── logs/
        └── download.log
```

## Integración con la app

La pantalla `EuvsArchiveScreen` (en `js/euvs-archive.jsx`) hace `fetch` a
`data/euvs-catalog.json` al abrirse. Como ese JSON está en el origen del
sitio, el Service Worker lo sirve offline tras la primera visita (estrategia
runtime cache, no precache — ver comentarios en `sw.js`).

La pantalla **nunca embebe los PDFs**: solo muestra metadatos y un enlace
saliente a `archive.org/details/<id>`.
