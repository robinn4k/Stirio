# Auditoría Stirio (v12.50 → v12.51) y plan iOS

Fecha: noviembre 2026. Método: análisis estático (sintaxis JSX, colisiones de
globals entre scripts Babel, rutas de `index.html`/`sw.js`, claves i18n) y
recorrido automático de los 20 modos de Inicio en Chromium sin interfaz con
viewport de iPhone 13, en ES. Los 354 tests de Vitest pasan.

## Arreglado en este PR

| # | Fallo | Impacto | Arreglo |
|---|---|---|---|
| 1 | React, ReactDOM y Babel se cargaban de unpkg y el SW no cachea recursos cross-origin | Arranque en frío sin red → pantalla en blanco (rompe "offline-first") | Copias en `vendor/` (de npm, Babel verificado contra el hash SRI anterior) y precacheadas |
| 2 | Se servía la build **development** de React en producción | Render bastante más lento, más memoria | Build de producción |
| 3 | Fraunces y JetBrains Mono venían de `fonts.gstatic.com`, bloqueado por la CSP `font-src 'self'` | Las fuentes de marca no cargaban nunca (fallback del sistema) | Fuentes alojadas en `fonts/` (OFL), con la cursiva de verdad |
| 4 | 13 artículos duplicados en `wiki-data.js` (licores y mixers) | Aparecían dos veces en la Enciclopedia; claves React duplicadas en Reels | Eliminados + test de regresión `tests/wiki-data.test.js` |
| 5 | `three-scene.jsx` importaba `./wiki-3d.js` relativo al documento | Las escenas 3D de Reels/artículos nunca se montaban (404) | Ruta `./js/wiki-3d.js` |
| 6 | Banner de cookies: solo "Aceptar" y clave distinta de `cookies.html` | No cumple RGPD (sin rechazar); cambiar la decisión en la política no tenía efecto | Botón "Rechazar" y clave común `stirio_cookie_consent` (migra la antigua) |
| 7 | Perfil: "Back" en inglés, "desconocido" y "se unió · 🌍 tierra" (texto de relleno) | Copy roto | `t('common.back')`, "invitado" como en Inicio, fecha real de alta (`profile.joined_on`, 5 idiomas) |

## Pendiente (priorizado)

1. **Las 10 lecciones de 60 s no están traducidas** (`js/data.js`): mezclan inglés y
   español a mano, sin `t()`. Es el contenido central de aprendizaje → primera
   prioridad de contenido.
2. **Cobertura i18n**: faltan ~320 claves por idioma (sobre todo `wiki.art.*`, que
   el cron de IA va rellenando) y en EN hay ~2.250 textos idénticos al español.
3. **`js/cookies.js` es código muerto**: no se carga en ninguna página, así que
   Firebase Analytics nunca se activa aunque el usuario acepte. Decidir si se
   quiere analítica (y añadir los dominios de GA a la CSP) o borrar el archivo.
4. **Imágenes enlazadas desde `iba-world.com`** (hotlinking): frágil y dudoso
   legalmente; mejor alojarlas o usar Unsplash.
5. **Leaflet, Three.js y Firebase siguen en CDN** (jsdelivr / unpkg / gstatic): el
   mapa, el 3D y el login no funcionan sin red. Para iOS conviene alojarlos también.

No verificable desde este entorno (sin red externa): login con Google/Firebase,
duelos en tiempo real, el mapa Leaflet y las fotos de Unsplash.

## Plan iOS con Capacitor

**Fase 1 — Paso de build (siguiente PR).** Precompilar cada `.jsx` a `.js` con
esbuild (transformación archivo a archivo, sin bundling, así se mantienen los
globals compartidos) en un `dist/`. Quita Babel del navegador (≈3 MB y la
compilación en cada arranque), que en un iPhone es la mayor parte del tiempo de
arranque. La web sigue funcionando igual.

**Fase 2 — Envoltorio Capacitor.** `@capacitor/core` + `@capacitor/ios`,
`webDir: dist`. Alojar Leaflet/Three/Firebase en local. Ajustar la CSP para el
esquema `capacitor://`. El SW no se usa dentro de la app nativa (los archivos ya
van en el bundle).

**Fase 3 — Nativo donde se nota.** Haptics, barra de estado y safe areas, splash
e icono, notificaciones locales para la racha diaria, Sign in with Apple
(obligatorio en App Store si se ofrece Google) y compartir nativo.

**Fase 4 — App Store.** Necesita un Mac con Xcode y cuenta de Apple Developer:
firma, TestFlight, privacidad (App Privacy), clasificación por edad (contenido
de alcohol → 17+).

Las fases 1 y 2 se pueden hacer casi enteras desde aquí; compilar y probar en el
simulador requiere tu Mac.
