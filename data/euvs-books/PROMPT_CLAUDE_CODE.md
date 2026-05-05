# Prompt para Claude Code — Proyecto stirio

Pega este prompt en Claude Code una vez que hayas clonado el repo en local. Está diseñado para ser autocontenido y resumible: si lo ejecutas varias veces, salta los libros ya hechos y continúa donde se quedó.

---

## CONTEXTO

Estoy construyendo una enciclopedia de cócteles llamada **stirio**. Tengo un repositorio con ~378 libros de coctelería vintage (1700s–1960s) escaneados de la colección EUVS. Cada libro existe como:

- `*.pdf` — el escaneo original
- `txt/*.txt` — texto extraído con `pdftotext` (calidad variable, con errores de OCR)
- `json/*.json` — versión estructurada (¡esto es lo que hay que generar!)

**Tarea**: convertir cada `.txt` en un `.json` siguiendo el schema en `json/_SCHEMA.md`, con texto original limpio + traducción al español + recetas estructuradas (ingredientes con cantidad/unidad/item, método, vaso, guarnición).

**Estado actual**: 29 de 378 hechos. Faltan 349 (336 con .txt limpio + 14 que están en `needs-reocr/` y necesitan re-OCR primero con Tesseract).

---

## ESTRUCTURA DEL REPO

```
vintage-cocktail-books-euvs/
├── *.pdf                    # 364 PDFs con OCR embebido bueno
├── txt/                     # 364 .txt extraídos con pdftotext
│   └── *.txt
├── json/                    # output: un JSON por libro
│   ├── _SCHEMA.md           # esquema canónico — léelo primero
│   ├── 1862-jerry-thomas-bartenders-guide.json
│   ├── 1896-bariana-louis-fouquet.json
│   └── ... (29 hechos)
├── needs-reocr/             # 14 PDFs cuyo .txt salió vacío (escaneo solo-imagen)
│   ├── *.pdf
│   └── txt/*.txt            # los .txt vacíos originales
├── PROMPT_CLAUDE_CODE.md    # este archivo
└── README.md
```

---

## REGLA DE NOMBRADO (slugify)

Cada `txt/<filename>.txt` produce `json/<slug>.json` donde `slug` se calcula así:

```python
import re, unicodedata

ALIASES = {
    "1862 The Bar Tender's Guide price $1.50 by Jerry Thomas": "1862-jerry-thomas-bartenders-guide",
    "Bariana by Louis Fouquet (1896)": "1896-bariana-louis-fouquet",
}

def slugify(name: str) -> str:
    """Genera el slug canónico para un nombre de libro (sin extensión)."""
    if name in ALIASES:
        return ALIASES[name]
    m = re.search(r"\b(1[7-9]\d{2}|20\d{2})\b", name)
    year = m.group(1) if m else None
    rest = re.sub(re.escape(year), "", name, count=1) if year else name
    rest = unicodedata.normalize("NFKD", rest).encode("ascii", "ignore").decode().lower()
    rest = re.sub(r"['‘’\"`]", "", rest)            # quita apóstrofos primero
    rest = re.sub(r"[^a-z0-9]+", "-", rest).strip("-")
    return f"{year}-{rest}".strip("-") if year else rest.strip("-")
```

Úsalo siempre para construir `book_id` y la ruta de output.

---

## FLUJO

### Paso 0: Lee `json/_SCHEMA.md` antes que nada

Es el contrato que cada JSON tiene que cumplir.

### Paso 1: Construye la cola de libros pendientes

```bash
python3 -c "
import os, re, unicodedata
ALIASES = {
    \"1862 The Bar Tender's Guide price \$1.50 by Jerry Thomas\": '1862-jerry-thomas-bartenders-guide',
    'Bariana by Louis Fouquet (1896)': '1896-bariana-louis-fouquet',
}
def slugify(name):
    if name in ALIASES: return ALIASES[name]
    m = re.search(r'\b(1[7-9]\d{2}|20\d{2})\b', name)
    year = m.group(1) if m else None
    rest = re.sub(re.escape(year), '', name, count=1) if year else name
    rest = unicodedata.normalize('NFKD', rest).encode('ascii','ignore').decode().lower()
    rest = re.sub(r\"['‘’\\\"\`]\", '', rest)
    rest = re.sub(r'[^a-z0-9]+', '-', rest).strip('-')
    return f'{year}-{rest}'.strip('-') if year else rest.strip('-')
done = set(f[:-5] for f in os.listdir('json') if f.endswith('.json'))
pending = []
for f in sorted(os.listdir('txt')):
    if not f.endswith('.txt'): continue
    base = f[:-4]
    slug = slugify(base)
    if slug not in done:
        size = os.path.getsize(f'txt/{f}')
        pending.append((size, slug, base))
pending.sort()
for s,sl,b in pending:
    print(f'{s}\t{sl}\t{b}')
" > pending.tsv
wc -l pending.tsv
```

### Paso 2: Por cada libro pendiente, dispatcha un subagente

Ordena por tamaño (cortos primero para ganar momentum) y procesa en **batches paralelos de 5–8 agentes** usando la herramienta Task del propio Claude Code.

Plantilla de prompt para cada subagente:

```
Convierte un libro vintage de cócteles a JSON estructurado bilingüe para la enciclopedia "stirio".

INPUT (.txt OCR ya extraído):
  txt/<NOMBRE_TXT>

SCHEMA (lee primero):
  json/_SCHEMA.md

OUTPUT (escribir aquí):
  json/<SLUG>.json

book_id: <SLUG>

Reglas:
1. Sigue exactamente el schema. Valida con
   `python3 -c "import json; json.load(open('json/<SLUG>.json'))"`
   antes de terminar.
2. Detecta el idioma (en/fr/es/it/de/la/mixed) y úsalo en metadata.language.
3. Llena los campos `_es` con traducción al español. Si el original ya es español, copia tal cual.
4. Limpia errores OCR con criterio (e.g. `tho`→`the`, `Curagao`→`Curaçao`).
   Mantén `raw_text` con el bloque ORIGINAL de cada receta para auditoría.
5. Identifica secciones: front_matter, preface, introduction, history,
   explanation, recipes_section, advertisement, appendix, index, other.
6. Por cada receta extrae:
   - name_original, name_es
   - category (cocktail / punch / cobbler / cup / julep / sour / fizz /
              flip / toddy / sangaree / smash / sling / crusta / sangría / other)
   - ingredients[]: cada uno con item_original, item_es, amount, unit, notes
   - method_original, method_es
   - glassware, garnish, yield, page_reference
   - raw_text (texto original íntegro de la receta)
7. Si el folleto es promocional (Calvert, Cinzano, Peychaud's, Goderham, etc.),
   marca el material publicitario como type:"advertisement".
8. Si el OCR está irrecuperable en zonas concretas, anótalo en `notes`
   pero NO inventes ingredientes.

Reporta al terminar: # secciones, # recetas, problemas detectados.
```

### Paso 3: Procesar los 14 libros en `needs-reocr/`

Estos PDFs son escaneos solo-imagen — `pdftotext` no extrajo nada. Hay que re-OCR con Tesseract antes de generar el JSON.

Necesitas instalar los language packs:

```bash
sudo apt install tesseract-ocr-fra tesseract-ocr-spa tesseract-ocr-lat
```

Y luego, por cada PDF en `needs-reocr/*.pdf`:

```bash
PDF="needs-reocr/<NOMBRE>.pdf"
WORK="/tmp/ocr-work/$(basename "$PDF" .pdf)"
mkdir -p "$WORK"

# 1. Renderizar todas las páginas a PNG (200 dpi, gris)
pdftoppm -r 200 -gray -png "$PDF" "$WORK/p"

# 2. OCR cada página en paralelo (4 procs).
#    Usa el idioma adecuado: eng / fra / spa / lat / "eng+lat" para mezclas.
ls "$WORK"/p-*.png | xargs -I{} -P 4 bash -c '
  out="${1%.png}"
  [ -s "$out.txt" ] && exit 0
  timeout 30 tesseract "$1" "$out" -l <LANG> --psm 3 2>/dev/null
' _ {}

# 3. Concatenar al .txt final, sobrescribiendo el vacío
OUT="txt/$(basename "$PDF" .pdf).txt"
> "$OUT"
for f in $(ls "$WORK"/p-*.txt | sort); do
  cat "$f" >> "$OUT"
  printf "\n\n" >> "$OUT"
done
```

Idiomas por libro (los 14):

| Libro | Idioma Tesseract |
|---|---|
| 1862 The Bar Tender's Guide price $2.50 by Jerry Thomas | `eng` |
| 1896 Drinks of All Kinds For All Seasons | `eng` |
| 1900 Harry Johnson's New and Improved Bartenders' Manual | `eng` |
| 1902 156 Recettes de Boissons Américaines | `fra` |
| 1904 Stuart's Fancy Drinks | `eng` |
| 1912 156 Recettes de Boissons Américaines | `fra` |
| 1917 Recipes for Mixed Drinks (Ensslin) | `eng` |
| 1920 156 recettes de boissons américaines | `fra` |
| 1930 Cocktails (Hotel Esplanade Prague) | `deu+fra` (manuscrito, baja calidad esperada) |
| 1935 Le Bar Américan (Pillaert) | `fra` |
| 1936 Gran Manual de Cocktails (Porta Mingot) | `spa` |
| 1950 El Barman Practico (Clavé) | `spa` |
| 1954 Anis Esprit de Joie et de Santé | `fra` |
| The Complete Distiller (Cooper, 1757) | `eng+lat` (inglés con citas latinas) |

Una vez re-OCR, sigue el mismo flujo del Paso 2 para generar el JSON.

### Paso 4: Validación final

```bash
python3 -c "
import json, os
total = 0
ok = 0
empty = []
for f in sorted(os.listdir('json')):
    if not f.endswith('.json'): continue
    total += 1
    try:
        d = json.load(open(f'json/{f}'))
        recs = d.get('recipes', [])
        if not recs:
            empty.append(f)
        else:
            ok += 1
    except Exception as e:
        print(f'INVALID {f}: {e}')
print(f'Total: {total}, con recetas: {ok}, vacíos: {len(empty)}')
for e in empty: print(' ', e)
"
```

---

## CONSEJOS

- **No proceses los 378 en serie**: usa la herramienta Task de Claude Code para lanzar 5–8 subagentes en paralelo.
- **Empieza por los cortos**: ordenar por tamaño da feedback rápido y descubres problemas de schema temprano.
- **Cuando un OCR es muy malo** (ej. el manuscrito de Praga 1930), mejor extrae lo que puedas y deja `notes` claras. No inventes ingredientes.
- **Idiomas mezclados**: muchos folletos cubanos (Sloppy Joe's, Bar La Florida) son bilingües inglés-español; usa `language: "mixed"` y traduce solo lo no-español.
- **Cuidado con los `_SCHEMA.md`**: si propones cambios al schema, hazlos antes de procesar más libros — re-procesar es caro.
- **Resumibilidad**: el script de pending detecta automáticamente qué falta. Puedes parar y reanudar cuando quieras.

---

## EJEMPLO DE INVOCACIÓN COMPLETA EN CLAUDE CODE

> Lee `vintage-cocktail-books-euvs/PROMPT_CLAUDE_CODE.md` y ejecuta el flujo completo. Empieza generando el archivo `pending.tsv`, después lanza 6 subagentes en paralelo con los 6 libros más cortos pendientes, espera a que terminen, y continúa hasta que `pending.tsv` esté vacío. Al final ejecuta la validación del Paso 4 y reporta cuántos libros quedaron con recetas vs. vacíos.
