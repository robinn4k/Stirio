# Análisis 360° de Stirio — Informe CTO/CPO

## Contexto

Stirio es una PWA de coctelería (v10.66, `index.html:53`) construida con React 18 UMD + Babel in-browser, Firebase (Auth, Firestore, RTDB, Storage), Leaflet, Three.js y Service Worker offline-first. Tiene **~22K LOC de JSX**, **5 idiomas** (ES/EN/FR/PT/DE, JSON bundles de 430-570KB cada uno), **12 archivos de test Vitest**, **~300 fichas IBA**, **24 rondas de trivia**, **10 lecciones de 60s**, y modos avanzados (Academia, Duels multiplayer vía RTDB, Blind Tasting, Comanda Chase, Arcade/Memory/Rhythm, Mapa Leaflet, Wiki 3D con Three.js). **Sin IA integrada, sin monetización, sin CI/CD**. El producto está maduro en alcance pero sin una cuña diferenciadora agresiva en el mercado.

Este documento entrega un análisis crítico y un plan de acción para que Stirio **destaque de forma agresiva** frente a Difford's Guide, Mixel, Cocktail Flow, Kindred Cocktails y duelos tipo Duolingo.

---

## 1. Análisis Técnico y de Innovación

### 1.1 Viabilidad técnica — Veredicto: **alta funcionalmente, media estructuralmente**

- **Lo que funciona bien**:
  - Arquitectura modular via `window.st*` globals bien documentada en `CLAUDE.md`. Cada responsabilidad aislada (`js/learn.js` XP, `js/daily.js` RNG seeded, `js/rivals.js` RTDB, `js/achievements.js`).
  - **Offline real**: Service Worker (`sw.js`, `STATIC_CACHE_VERSION = Stirio-v10.66`) cachea todos los assets estáticos + los 5 bundles i18n. Ninguna app de coctelería del top 20 del App Store funciona offline.
  - **PWA correcta**: manifest, icono iOS, splash, OG card, controllerchange auto-reload (`index.html:106-123`).
  - **RTDB multiplayer**: 1v1/1v3 con bot fallback es **raro en este vertical** — nadie más lo tiene.
  - **Determinismo**: Daily Challenge seeded por UTC date (`js/daily.js`) es la implementación correcta (todos los jugadores ven lo mismo, imposible trampear con cambio de fecha local).

- **Deudas técnicas críticas**:
  - **Babel in-browser + React UMD CDN** (`index.html:47-50`). Transpila ~22K LOC JSX en el cliente en cada carga. En móvil 4G real esto puede suponer **2-4s de Time-to-Interactive adicional**. Es el mayor bottleneck de percepción de calidad frente a competidores nativos.
  - **Sin build step, sin TypeScript, sin tree-shaking, sin minificación de app logic**. Todo el código de usuario se sirve en crudo.
  - **`js/screens.jsx` pesa 103KB / 2.037 LOC** y `js/app.jsx` pesa 37KB. El monolitismo de estos archivos contradice el principio de "modularidad" del `CLAUDE.md` y viola el propio guideline ("Never rewrite large files in a single pass").
  - **Tests sin CI** (`.github/` existe pero no se verifica ejecución automática de `vitest run` en PRs). 12 tests para 22K LOC = **cobertura anecdótica**.
  - **Dos archivos `app.js` (119KB) + `app.jsx` (37KB)** sugieren migración inconclusa. El legacy `app.js` es código muerto o duplicado — hay que auditarlo.
  - **Reliance en CDNs de terceros** (unpkg, jsdelivr) sin SRI hashes. Single-point-of-failure y vector de supply-chain.

### 1.2 Ventaja técnica injusta — 5 apuestas tecnológicas

1. **IA generativa como copiloto de barra (la apuesta principal)**:
   - **"Stirio Mentor"**: agente conversacional (Claude Haiku 4.5 por coste/latencia) con RAG sobre `js/repo-data.js` + `js/wiki-data.js` + glosario. El usuario pregunta *"¿Qué cóctel puedo hacer con ron, lima y menta si no tengo azúcar?"* y recibe sustituciones, ratios y la técnica correcta, **citando la ficha IBA**.
   - **"Generador de carta"**: prompt → 6 cócteles coherentes con el concepto del bar (*"tropical low-ABV, ingredientes locales de Galicia"*). **Output económico** para bares reales.
   - **Entrenador de paladar**: el modelo genera clues de Blind Tasting inéditos por ronda, rompiendo el límite de contenido estático actual.
   - **Vision**: el usuario fotografía la etiqueta de una botella y el agente devuelve ficha + 3 cócteles recomendados (Claude vision / Gemini Flash).
   - **Coste realista**: ~$0.005/interacción con caching agresivo; modelo freemium 10 consultas/día gratis.

2. **Arquitectura moderna sin romper la filosofía no-build**:
   - **Migrar a Vite + SWC preservando JSX-en-CDN como fallback** (dos entry points). Baja TTI ~60%, habilita TypeScript incremental (`.ts` islands), permite code splitting por ruta.
   - **Partir `screens.jsx` en 8-10 archivos por pantalla**. Refactor obligatorio antes de cualquier feature nueva grande.
   - **Edge functions (Cloudflare Workers o Firebase Functions Gen2)** para proxy de las llamadas LLM — protege la API key, permite rate limiting y caching por prompt.

3. **Datos y contenido vivo**:
   - **Firestore → BigQuery export** para analítica de producto real (qué preguntas fallan, qué cócteles nadie prueba, retention cohorts).
   - **Embeddings de cócteles** (Voyage o OpenAI `text-embedding-3-small`): permite *"cócteles parecidos a este"*, búsqueda semántica (*"algo amargo y refrescante"*), recomendación personalizada.

4. **3D y AR como moat visual**:
   - La Wiki 3D ya existe (Three.js v0.170, `js/wiki-scenes.js` 879 LOC). **Extenderla con WebXR**: apuntar la cámara a una copa real y superponer la receta correcta. Safari iOS 17+ ya soporta `xr-spatial-tracking` en PWA instalada.
   - **Model Viewer + decimación**: los `.glb` actuales (alambique, copa) son probablemente >2MB; pasar por `gltfpack` y servir `.ktx2` reduciría 70%.

5. **Voz y audio como modo manos-libres** (único en el vertical):
   - Web Speech API para dictar *"siguiente paso"* mientras el usuario tiene las manos llenas de hielo. Hook natural con el Comanda Chase.
   - Text-to-speech (Web Speech `SpeechSynthesis`) para narrar recetas — accesibilidad + diferenciador.

### 1.3 Escalabilidad

- **Firestore**: los contadores de XP y streaks están bien (lazy sync, merge logic en `js/achievements.js`), pero el **leaderboard global** (`js/leaderboard.js`) puede volverse caro a partir de ~10K DAU si no se introducen shards o agregaciones precomputadas.
- **RTDB para rivals** (`js/rivals.js`): correcto para <1000 duelos concurrentes. Más allá, migrar a Firestore en modo `onSnapshot` con TTL, o a un servicio dedicado (Ably, PartyKit, Durable Objects).
- **GitHub Pages como hosting**: no tiene edge caching ni compresión Brotli garantizada. **Migrar a Cloudflare Pages** (misma simplicidad, mejor TTFB global, Workers integrados).
- **i18n bundles pesados** (ES = 572KB JSON): splitear por namespace (`ui.json`, `fichas.json`, `trivia.json`) y cargar lazy por ruta. Ganancia >300KB en arranque.

### 1.4 Seguridad — brechas reales

- **Falta `Content-Security-Policy`** en `index.html`. Con Babel in-browser + CDNs de terceros, `script-src` correcto es complejo pero crítico. Hoy un XSS en cualquier string renderizado sin escape es catastrófico.
- **`database.rules.json` y Firestore rules**: auditar que los writes de leaderboard/achievements estén restringidos por `auth.uid == request.resource.data.uid` y que el schema esté validado en reglas (no en cliente).
- **API keys Firebase en cliente**: normales y correctas (no son secretas), pero **activar App Check con reCAPTCHA v3** es obligatorio antes de crecer — sin él, cualquier bot infla leaderboard y consume cuota.
- **Sin SRI hashes** en los `<script src="https://unpkg.com/...">`. Añadir `integrity` attributes.
- **Guest mode anónimo**: revisar que no permite escribir al leaderboard global (debería ser read-only hasta conversión a cuenta real).

---

## 2. Experiencia de Usuario (UX) y Curva de Aprendizaje

### 2.1 Diagnóstico del onboarding actual

El flujo actual (`js/screens.jsx`, `js/app.jsx:27-38`, versionado con `ONBOARDING_VERSION`) tiene **7 pasos**: idioma → auth → nombre/nivel → intereses → regular/mocktail → licor favorito → resumen. Es **correcto pero pesado**. Diagnóstico crítico:

- **Problema principal**: el usuario da **6 datos antes de probar nada**. En apps de aprendizaje (Duolingo, Elevate) la regla moderna es **"Play first, register later"**. Cada paso antes del primer "momento mágico" pierde ~20% de usuarios.
- **La auth en paso 2 es un leak masivo**. Pedir Google/email antes de que el usuario entienda para qué sirve la app mata conversión móvil al ~40%.
- **Los 4 pasos de personalización son buenos datos pero mala UX**: el usuario no sabe aún por qué le preguntas si le gusta Tiki o si bebe alcohol — no puede juzgar.

### 2.2 Rediseño: onboarding de **90 segundos** con aha moment a los **30s**

Plan concreto, en orden:

1. **Paso 0 (0-5s, sin tocar nada)**: al abrir la app aparece una **mini-cata visual animada**: 3 cócteles (Negroni, Margarita, Mojito) giran lentamente en 3D con sus ingredientes orbitando. Auto-play, silencioso. Establece el tono premium antes de ninguna fricción.
2. **Paso 1 (5-20s, el hook)**: "**Adivina el cóctel en 15 segundos**" — 1 sola pregunta con 4 imágenes (copa + color + ingredientes). Aciertes o falles, se despliega la ficha IBA con audio corto, confetti, **"+20 XP"**. **Este es el Aha moment.** El usuario entiende en 15s que la app es un juego que enseña.
3. **Paso 2 (20-40s)**: "**Desbloquea tu carta de bienvenida**" — selección rápida por tap de licor favorito (6 iconos) + nivel (3 opciones visuales, no texto). Skipeable con *"Sorpréndeme"*.
4. **Paso 3 (40-75s)**: primera **micro-lección de 45s** (una de las 10 en `js/data.js`) adaptada al licor elegido. Termina con streak = 1 🔥 visible.
5. **Paso 4 (75-90s, soft-gate)**: *"Guarda tu progreso para no perder tu racha"* → botón Google + botón *"Seguir como invitado"* igualmente prominente. Auth **después** de valor demostrado convierte 2-3× más.
6. **Idioma**: detectar `navigator.language` por defecto, botón discreto arriba a la derecha para cambiarlo. Eliminar el paso explícito salvo para usuarios cuyo idioma no sea soportado.

### 2.3 Reducción de carga cognitiva en la app principal

- **Bottom nav debe tener 4 ítems, no más**: `Aprender · Recetas · Duelo · Tú`. Todo lo demás (Arcade, Memory, Rhythm, Comanda, Wiki 3D, Mapa) se agrupa en un **hub "Explorar"** dentro de Tú, o como *weekly rotating feature* en Home. Hoy la `ModeSheet` expone demasiadas opciones de golpe (síntoma: 17 pantallas JSX compitiendo por atención).
- **Home debe mostrar UNA sola CTA primaria arriba**: *"Tu próxima lección (45s)"*. Todo lo demás scroll vertical con jerarquía clara: Daily → Featured → Continuar Academia → Modos. El usuario que abre la app a las 18:00 con 2 min libres no quiere decidir, quiere hacer.
- **Confirmar con datos**: instrumentar `screen_view`, `cta_click`, `lesson_complete` con Firebase Analytics / PostHog. Sin eventos, todo este rediseño es opinión.
- **Eliminar pantallas zombi**: si Constructor (`js/constructor.js`, 2KB) y algún minijuego tienen <5% de engagement tras 30 días de datos, se archivan. **Saturar el menú con features poco usadas penaliza a todo el producto.**

### 2.4 Retención más allá del día 1

- **Streak freeze** (1 día gratis/semana, más con Premium): copiado de Duolingo porque funciona. Rompe la ansiedad del "ya perdí mi racha".
- **Notificación local inteligente**: en vez de *"¡Te echamos de menos!"*, enviar *"El Negroni de hoy tiene 3 ingredientes — ¿los aciertas en 15s?"*. Concreto, jugable desde la notificación con Web Push Actions.
- **Comeback reward**: si un usuario vuelve tras 7+ días, recibe *"Modo Catador"* desbloqueado por 24h (acceso a todo el contenido premium). Cuesta cero y reengancha.
- **Rituales sociales**: Duel weekly **"Liga del Viernes"**: brackets de 16 amigos, resultado se comparte con imagen generada (OG dinámica). Viral loop nativo.

### 2.5 Accesibilidad (gap actual)

- Revisar contrastes OKLCH en los 6 temas — algunos combos (`featured=stacked` + `theme=lounge`) pueden fallar WCAG AA.
- `prefers-reduced-motion`: las animaciones de confetti y XPPop deben respetarlo.
- Soporte de screen reader en `LessonPlayer` (`js/lesson.jsx`) — los `div` clickeables necesitan `role="button"`, `aria-label`.
- Hit targets: en móvil real (pulgar), todo tap target debe ser ≥44×44px. Auditable con Lighthouse.

---

## 3. Potencial de Mercado y Diferenciación

### 3.1 El dolor real — y por qué las soluciones actuales fallan

- **El "dolor" genuino NO es "no sé hacer un Negroni"**. La gente googlea eso en 10s. El dolor real tiene tres capas:
  1. **Dolor del aprendiz curioso** (mercado consumer, 90% del volumen): *"Quiero parecer competente cuando pido en un bar o recibo en casa, sin leer un libro de 400 páginas."* Las apps actuales (Mixel, Cocktail Flow) son **catálogos bonitos pero inertes** — no enseñan, no retan, no recuerdan lo que ya sabes.
  2. **Dolor del bartender pro en formación** (mercado profesional, 10% volumen pero alto LTV): *"Necesito memorizar las 90 IBA + técnicas + historia para una certificación."* Hoy usa PDFs, flashcards Anki genéricas y cursos presenciales caros. **Nadie ofrece spaced repetition real para coctelería.**
  3. **Dolor del bar owner**: *"Necesito formar a mi staff junior rápido y uniformemente."* Hoy lo resuelve con hojas impresas y el barman senior enseñando a mano. Mercado B2B virgen.
- **Por qué las apps líderes fallan**:
  - **Difford's Guide**: enciclopedia exhaustiva, cero gamificación, UI de 2015.
  - **Mixel / Cocktail Flow / Highball**: estéticas brillantes pero pasivas (leer recetas). Cero *loop* de aprendizaje.
  - **Kindred Cocktails**: base de datos comunitaria, UX técnica.
  - **Drinks Mixer**: ads everywhere.
  - **Ninguna** combina spaced repetition + duelo multijugador + 3D + blind tasting + offline. Stirio ya tiene todas las piezas.

### 3.2 Estrategia Océano Azul — el posicionamiento diferencial

El framework ERIC (Eliminar / Reducir / Incrementar / Crear) aplicado:

- **Eliminar** (lo que el mercado da por sentado pero no aporta):
  - Catálogo pasivo infinito de recetas — es lo que todo el mundo hace.
  - Complejidad enciclopédica de primera entrada (el usuario nuevo no quiere 900 cócteles, quiere 10 bien sabidos).
  - Publicidad intrusiva.

- **Reducir**:
  - Fricción de onboarding (hoy 7 pasos → bajar a 3).
  - Número de modos en el bottom nav (hoy ~8 → a 4).
  - Peso del bundle inicial (Babel in-browser).

- **Incrementar**:
  - **Profundidad pedagógica**: spaced repetition real, tracking de mastery por ficha/técnica, no solo XP global.
  - **Socialización**: duelos, ligas semanales, compartir progreso.
  - **Sofisticación visual**: 3D + AR + microinteracciones cuidadas.

- **Crear** (lo que nadie tiene todavía):
  - **IA Mentor conversacional** con RAG sobre la base IBA. Único.
  - **Modo AR "What's this?"**: apuntar a una botella → ficha + cócteles.
  - **Liga semanal de amigos** con bracket público.
  - **Modo Certificación**: rutas estructuradas tipo CMS / WSET para bartenders, con badge verificable (NFT-free, simple URL firmada).
  - **Modo B2B "Staff Trainer"**: dashboard para bar owners, asignar rutas a su equipo, ver progreso. **Canal de monetización premium.**

### 3.3 Positioning statement propuesto

> **"Stirio es el gimnasio mental de la coctelería. Juegas 60 segundos al día, duelas con amigos, y en un mes reconoces 90 cócteles a ciegas. No es un recetario: es entrenamiento."**

Posicionar contra **"Duolingo de la coctelería"** en comms públicas porque es la analogía que el mercado entiende en 2 segundos. En producto, superar a Duolingo en una dimensión que ellos no pueden igualar: **la componente sensorial y social** (blind tasting, duels en vivo, AR).

### 3.4 Qué descartar o evitar (disciplina de producto)

- **NO añadir gestión de inventario / stock de bar**. Ese es otro producto (BevSpot, Backbar). Diluye el foco.
- **NO añadir red social tipo Instagram de cócteles**. Untappd ya lo hace y requiere masa crítica imposible de arrancar.
- **NO añadir delivery de cócteles o marketplace de ingredientes**. Distracciones monumentales.
- **NO añadir modo "pregúntale a un experto humano"**. Operacionalmente insostenible; el AI Mentor lo reemplaza.
- **NO perseguir gamificación barroca** (docenas de badges, mascotas virtuales, colecciones NFT). Ya hay 18 achievements — **parar ahí**. Más confunde.
- **NO ir multi-plataforma nativa aún**. La PWA + iOS "Add to Home Screen" cubren el 95% del caso. App Store / Play Store después de product-market fit demostrado.

### 3.5 Análisis competitivo rápido (moat defensible)

| Eje | Stirio hoy | Stirio propuesto | Competencia top |
|---|---|---|---|
| Gamificación | 7/10 | 9/10 | 2/10 |
| Contenido IBA | 9/10 | 9/10 | 8/10 |
| Multiplayer | 8/10 (único) | 9/10 | 0/10 |
| IA/personalización | 0/10 | 9/10 | 1/10 |
| 3D / AR | 6/10 | 9/10 | 0/10 |
| Offline | 9/10 | 9/10 | 2/10 |
| B2B | 0/10 | 7/10 | 0/10 |

El **moat real** que nadie puede copiar rápido: la combinación de **contenido curado IBA + spaced repetition + multiplayer + IA con RAG sobre datos propietarios**. Cada pieza suelta es replicable; el stack combinado requiere 18-24 meses para que un competidor lo replique.

---

## 4. Estrategia de Marketing Tecnológico (Go-to-Market)

### 4.1 Comunicar valor técnico a un público no técnico

La regla es **traducir ingeniería a beneficios sensoriales y emocionales**, no a specs:

- "Funciona sin internet en el metro y en el avión" — **no** "PWA con Service Worker cacheando 2MB de assets".
- "Te reta a duelos en vivo contra tus amigos, responde el bot si nadie más juega" — **no** "Multiplayer sobre Firebase RTDB con bot fallback".
- "Aprende viendo los cócteles en 3D girando en tu mano" — **no** "Three.js v0.170 con importmap y lazy-loaded glTF".
- "Tu mentor de barra personal que nunca duerme" — **no** "Claude Haiku con RAG sobre 300 fichas IBA".
- "Hablamos 5 idiomas — cambia con un gesto" — **no** "i18n runtime con fallback chain y 2.4MB de JSON".

### 4.2 Narrativa maestra (pitch de 30 segundos)

> *"Todo el mundo quiere saber de coctelería pero nadie tiene tiempo para leer un libro. Stirio te lo enseña en sesiones de 60 segundos, como un juego. Duelas contra tus amigos. Reconoces cócteles a ciegas por el olor. Tu mentor con IA resuelve cualquier duda en 2 segundos. En un mes dominas los 90 clásicos del mundo. Funciona sin internet. Gratis."*

Esta misma narrativa se adapta a landing page, app stores, video de 15s de TikTok, y deck de inversión sin cambios. **Consistencia = credibilidad.**

### 4.3 Bucles de viralidad product-led integrados en el software

1. **Duelo compartible con OG dinámica**:
   - Al terminar un duel, botón *"Comparte y reta a alguien"* genera una URL `stirio.app/duel/{id}` con OG image renderizada server-side (Cloudflare Worker + Satori) mostrando el score, el cóctel ganador y los dos avatares.
   - Quien hace click entra directo a una revancha. **k-factor esperado >0.4 en cohorte activa.**

2. **Resultado de Blind Tasting como carta coleccionable**:
   - Al adivinar un cóctel a ciegas, generar una "carta" (imagen 1080×1920 vertical, premium visual) con el cóctel, tu puntuación y un QR. Compartible en Instagram Stories con un tap. Tu carta contiene el logo sutil y el handle `@stirio`.

3. **Liga semanal con bracket público**:
   - Viernes 20:00 local, el usuario invita a 15 amigos y se genera un bracket. Ganador recibe 1 semana de **Stirio Pro** gratis (IA ilimitada, streak freeze). **Cada bracket trae 15 registros nuevos en la práctica.**

4. **"Reto del día"**:
   - Daily Challenge ya es determinístico (`js/daily.js`). Añadir botón *"Desafía a alguien"* que manda a un amigo la misma seed — ambos pueden comparar resultados. Transforma un feature ya existente en un vector viral.

5. **Certificación compartible en LinkedIn**:
   - Al completar la "Ruta IBA Unforgettables" (78 cócteles con mastery ≥0.8), badge verificable con URL firmada. Auto-post a LinkedIn con un clic. **Trae tráfico de un público profesional de alto valor.**

6. **Referral tangible**:
   - *"Invita a 3 amigos → desbloquea el Modo Catador por 30 días"*. Link personalizado trackeado (UTM + Firebase Dynamic Links o alternativa).

### 4.4 Go-to-market táctico (canales priorizados)

1. **TikTok / Instagram Reels orgánico** (canal principal, coste cero):
   - **Serie "¿Qué cóctel es?"**: vídeo vertical, 5s de ingredientes cayendo en la copa, pregunta *"¿Lo sabes?"*. Call-to-action sutil: *"Juega en Stirio"*. Este formato es replicable indefinidamente.
   - **Serie "Historia en 15s"**: un bartender conocido cuenta el origen de un clásico. Contenido shareable de alto valor educativo.

2. **Product Hunt launch** (week 1 post-pulido):
   - Positioning: *"Duolingo meets cocktail school, with real-time duels and an AI bartender mentor"*. Asset: video de 30s mostrando duel + blind tasting + 3D wiki.

3. **Partnerships con escuelas de bartending y marcas de spirits**:
   - Escuelas (EBS, European Bartender School, Cocktail Spirits): acuerdo para usar Stirio como herramienta de práctica. **Trae credibilidad pro instantánea.**
   - Marcas (Bacardí, Campari, Diageo): contenido patrocinado en modo "Ruta Negroni oficial de Campari" — revenue B2B sin ads.

4. **SEO técnico**:
   - Generar páginas públicas indexables por cóctel (`stirio.app/cocktail/negroni`) con schema.org `Recipe`, contenido extraído del repo-data. Long-tail de coctelería es masivo y poco competido por apps (Difford's domina, pero su UX es vieja).

5. **Comunidades**: r/cocktails (150K), r/bartenders, r/mixology, Discord de bartending. **No spamear**: participar genuinamente, compartir data proprietaria (*"Los 10 cócteles más fallados por usuarios de Stirio"*) que solo Stirio puede producir.

### 4.5 Métricas de éxito (dashboard semanal)

- **Activation**: % de usuarios que completan la primera lección tras onboarding. Meta: >70%.
- **D1 / D7 / D30 retention**. Meta D30: >15% (benchmark edtech mobile).
- **k-factor viral** (invitados / invitadores): >0.4.
- **DAU/MAU**: >25% (stickiness).
- **IA engagement**: % de usuarios activos que usan el Mentor / semana. Meta: >30%.
- **Revenue per user** (post-monetización): target $2-3/mes blended (Pro subs + B2B).

### 4.6 Monetización sensata (no urgente, pero planificada)

- **Freemium**: todo lo actual gratis. Pro ($4.99/mes o $39/año):
  - IA Mentor ilimitado (vs 10 consultas/día free).
  - Streak freeze ilimitados.
  - Rutas avanzadas (IBA New Era, mixología molecular, tiki history).
  - Sin logos en las tarjetas compartibles.
  - Early access a features.
- **B2B Staff Trainer** ($29-99/mes por bar): dashboard, asignar rutas, tracking de progreso del staff. **Canal de alto margen.**
- **Sponsored content** con marcas: rutas curadas por marca, claramente etiquetadas. Nunca ads intrusivos.

---

## 5. Plan de acción priorizado — próximos 90 días

### Sprint 1-2 (semanas 1-4) — fundaciones técnicas
- Migrar a **Vite + SWC** preservando funcionamiento offline y estructura actual.
- Partir `js/screens.jsx` (2.037 LOC) en 8-10 archivos por pantalla.
- Configurar **GitHub Actions CI** ejecutando `vitest run` + Lighthouse en cada PR.
- Activar **Firebase App Check** y auditar reglas de Firestore/RTDB.
- Añadir **CSP + SRI** en `index.html`.
- Instrumentar analytics básico (PostHog self-hosted o Firebase Analytics).

### Sprint 3-4 (semanas 5-8) — aha moment e IA
- Rediseñar onboarding a 3 pasos (ver §2.2). A/B test contra el actual.
- Integrar **Claude Haiku 4.5** vía Firebase Function / Cloudflare Worker con RAG sobre `repo-data.js`. Ship MVP del Mentor.
- Generar OG dinámicas para duels y blind tasting results.

### Sprint 5-6 (semanas 9-12) — crecimiento
- Liga semanal de amigos con bracket.
- SEO: páginas públicas por cóctel.
- Product Hunt launch.
- Prototipo B2B Staff Trainer (dashboard básico).

---

## 6. Verificación y validación

- **Métricas objetivas**: Lighthouse móvil >90, TTI <3s en 4G emulado, bundle inicial <200KB gzipped, tests pasan en CI.
- **Métricas de producto**: activation rate pre/post rediseño de onboarding (A/B), D7 retention, k-factor de duels compartidos.
- **Riesgos a vigilar**:
  - Migración a Vite puede romper el flujo `window.st*` — hay que preservar globals o refactorizar la capa de comunicación entre módulos.
  - Coste de IA: monitorizar $/DAU. Si excede $0.10/DAU, recortar ventana de contexto o cachear respuestas semánticamente similares.
  - Firebase costs con crecimiento: alerta a partir de 5K DAU, plan de migración de leaderboard a precomputed aggregates.

---

## 7. Veredicto ejecutivo

Stirio es un **producto serio disfrazado de proyecto personal**. Tiene la base de contenido, la arquitectura modular y los modos únicos (multiplayer + blind tasting + 3D + offline) que la competencia no puede replicar rápido. Le faltan **tres cosas para destacar agresivamente**:

1. **Una cuña de IA generativa** (Mentor + generación de contenido) que convierta el catálogo estático en un producto vivo.
2. **Un onboarding con aha moment en 30 segundos** que convierta tráfico curioso en usuarios activos.
3. **Un motor de viralidad nativo** (OG dinámicas + liga semanal + certificación compartible) que haga crecer la base sin presupuesto de adquisición.

Con estas tres inversiones en 90 días, el producto pasa de "buena PWA nicho" a **candidato a categoría**. Sin ellas, se queda como un side-project técnicamente brillante pero comercialmente inerte. La decisión es de foco, no de capacidad.




