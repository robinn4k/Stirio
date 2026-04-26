# Stirio — Auditoría QA & Seguridad (rama `claude/qa-security-analysis-Noiwg`)

Auditoría focalizada en (a) integridad del leaderboard, (b) bugs lógicos del
`LessonPlayer` y sus step components, (c) resiliencia ante entradas
manipuladas. Complementa — no reemplaza — el plan estratégico en
[`strategy.md`](./strategy.md) y la lista operativa en
[`security-checklist.md`](./security-checklist.md).

Cada hallazgo lleva un identificador estable (F1…F13) que aparece también en
los mensajes de commit y en los tests de regresión añadidos en esta rama.

## Resumen ejecutivo

| Severidad | Hallazgos | Estado |
|---|---|---|
| Crítica | F1, F2, F3, F4 | F1 / F2 / F3 / F4 mitigados aquí (ver "Fix aplicado") |
| Alta | F5, F6, F7, F8, F9, F10, F11 | Todos parcheados |
| Media | F12, F13 | F12 parcheado, F13 documentado como deuda |

Tests de regresión añadidos: 22 nuevos casos en `tests/learn.test.js`,
`tests/lang.test.js`, `tests/rivals.test.js`. Suite completa: 334/334 verde.

## Hallazgos críticos — Integridad del leaderboard

### F1 — `firestore.rules` no validaba campos de ranking

**Archivo:** `firestore.rules:54-61` (antes del fix)
**Vector:** Cliente autenticado escribe `setDoc(doc(db, 'users', uid), { xpTotal: 999999999, level: 16 })` desde devtools. La regla original sólo validaba `request.auth.uid === userId` y la coherencia opcional del campo `uid` — cualquier otro campo era libre. Combinado con F2, el ataque es trivial.

**Fix aplicado:** Caps numéricos en `xpTotal` (≤ 10M), `level` (1–16), `streakDays` (≤ 3650), `best` (≤ 1M), `total`/`games` (≥ 0), `name` (≤ 80 chars). Ver diff en `firestore.rules`. **Requiere `firebase deploy --only firestore:rules` para que tenga efecto en producción** — el archivo en repo no se aplica solo (ver `security-checklist.md` §1.3).

**Verificación:** `firebase emulators:start --only firestore`, intentar `setDoc(doc(db, 'users', myUid), { xpTotal: 99999999 })` desde un cliente autenticado → debe ser rechazado.

### F2 — `addXp()` sin cap superior ni validación de tipo

**Archivo:** `js/learn.js:377-396` (antes del fix)
**Vector:** `addXp(Number.MAX_SAFE_INTEGER)` o `addXp(Infinity)` desde devtools. La protección original (`Math.max(0, amount | 0)`) sólo defendía contra negativos y `NaN` — no había techo y `Infinity | 0 === 0` la ocultaba en lugar de loggear el ataque. Cualquier overflow se propagaba al `users/{uid}.xpTotal` vía `syncLearnToCloud`.

**Fix aplicado:** Rechazo explícito de `!Number.isFinite(amount) || amount <= 0`, cap por llamada `MAX_XP_PER_CALL = 1000`, cap acumulado `MAX_XP_TOTAL = 10_000_000`, sanitización del prevTotal leído de localStorage para defender contra una corrupción previa.

**Tests:** `tests/learn.test.js` → describe blocks "addXp — input validation" y "addXp — storage failure resilience" (10 nuevos casos).

### F3 — RTDB `rooms/$roomId` permitía sobrescritura completa por terceros

**Archivo:** `database.rules.json:18` (antes del fix)
**Vector:** La cláusula `data.child('status').val() === 'waiting'` permitía a cualquier usuario autenticado reescribir el nodo entero `rooms/$roomId` mientras estuviera en estado waiting — incluyendo `players/p1/score`. Atacante puede inflar el score del rival propio o sabotear partidas ajenas.

**Fix aplicado:** Restricción de la cláusula waiting para exigir que el escritor sea quien se está añadiendo a un slot vacío (`newData.child('players/{p2|p3|p4}/uid').val() === auth.uid`). Validaciones `.validate` por slot: `score` numérico ≤ 5000, `uid`/`name` con tamaño máximo. **Requiere `firebase deploy --only database` para producción.**

### F4 — `submitAnswer` confiaba en el `correct: boolean` del cliente

**Archivo:** `js/rivals.js:392-419` (antes del fix)
**Vector:** El comentario en el código aseguraba "computed from the answer data rather than trusting the client value", pero `correct` es directamente el parámetro del cliente. `submitAnswer(roomId, mySlot, qIndex, true, 60)` sumaba 400 puntos por pregunta sin verificar si la respuesta era correcta de verdad. 10 preguntas × 400 = leaderboard inflado en una sola partida.

**Fix aplicado (parcial):**
- Función pura `clampedAnswerPoints(correct, timeLeft)` exportada (testeable sin Firebase) que clamp+capa los puntos a `MAX_POINTS_PER_ANSWER = 400`.
- Validación cliente que el slot pertenezca al `auth.currentUser.uid` actual (defensa en profundidad además de la regla RTDB).
- Coerción de `correct` a boolean antes del write.

**Deuda pendiente:** El fix completo requiere validar `correct` contra la respuesta canónica de la pregunta server-side, lo cual exige una **Cloud Function** que conozca el `correctIndex`. Documentado como deferred work en este audit; tracking issue recomendado.

**Tests:** `tests/rivals.test.js` → describe "clampedAnswerPoints" (8 nuevos casos cubriendo `timeLeft` >60, negativo, NaN, no-numérico, `correct` no-boolean, cap del cap).

## Hallazgos altos — Lógica del LessonPlayer

### F5 — `setTimeout` de avance de step no se cancelaba al desmontar

**Archivo:** `js/lesson.jsx:59-63`
**Vector:** Si el usuario cierra la lección durante el delay de feedback (1100–3200 ms), React intenta `setStepIdx`/`finish()` sobre componente desmontado (warning en consola + posible `finish()` doble si el timer global expira en paralelo).

**Fix aplicado:** `advanceTimeoutRef = useRef(null)` que guarda el handle del timeout; `useEffect(() => () => clearTimeout(advanceTimeoutRef.current), [])` lo limpia en unmount.

### F6 — Race en doble-click sobre el mismo botón de respuesta

**Archivo:** `js/lesson.jsx:38-39`
**Vector:** El guard `if (stepFeedback) return` depende de un setState asíncrono. Dos clicks dentro del mismo frame React (≤ 16 ms) ven `stepFeedback === null` y disparan dos veces: XP duplicado, dos timeouts encolados, posible salto de pregunta.

**Fix aplicado:** `answerLockRef = useRef(false)` síncrono que se setea ANTES de cualquier setState. Reset por step en `useEffect([stepIdx])`.

### F7 — `multi.jsx` crashea si `step.correct` es undefined

**Archivo:** `js/lesson-steps/multi.jsx:10` (antes del fix)
**Vector:** Cualquier lesson con un step `multi` sin `correct` (typo en data, fixture roto) revienta con `TypeError: Cannot read properties of undefined (reading 'length')`. El `ErrorBoundary` de `app.jsx` lo captura, pero la UX queda en pantalla de error en lugar de avanzar.

**Fix aplicado:** Guard `Array.isArray(step?.correct) ? step.correct : []` y render alternativo con CTA "Saltar" si `need === 0`. Nuevas claves i18n: `lesson.step_broken`, `lesson.step_broken_body` (en es/en/fr/pt/de).

### F8 — `ratio.jsx` produce `NaN%` con todos los sliders en 0

**Archivo:** `js/lesson-steps/ratio.jsx:34` (antes del fix)
**Vector:** `(vals[k] / total) * 100` con `total === 0` da `NaN`, el glass viz colapsa.

**Fix aplicado:** Guard `total > 0 ? (vals[k] / total) * 100 : 0`.

### F9 — `timing.jsx` usaba `Date.now()` (no monotónico)

**Archivo:** `js/lesson-steps/timing.jsx:12-13` (antes del fix)
**Vector:** Un ajuste NTP o cambio manual del reloj durante el step produce tiempos negativos / saltos. El usuario puede explotar esto adelantando el reloj para aparecer "perfecto".

**Fix aplicado:** `Date.now()` → `performance.now()` en `t0` y en el tick.

### F10 — `lang.js` interpreta `$&`/`$1` en valores de parámetros

**Archivo:** `js/lang.js:94-95` (antes del fix)
**Vector:** `String.prototype.replace(re, params[k])` interpreta el segundo argumento como replacement string, expandiendo `$&` (match completo), `$1` (capture), `$$` (literal `$`). Un nombre de usuario con `$&` corrompe la traducción visible. Adicionalmente, `new RegExp(\`\\{${k}\\}\`)` no escapa metacaracteres en la KEY, así que `key.with.dots` se sobre-permite.

**Fix aplicado:**
- Función replacement (`() => String(value ?? '')`) en lugar de string — desactiva la interpretación de `$` patterns.
- Escape de la key con `k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` antes de construir el RegExp.

**Tests:** `tests/lang.test.js` → 4 nuevos casos cubriendo `$&`, `$1`/`$$`/`` $` ``, claves con metacaracteres, params null.

### F11 — RTDB `codes/$code` permitía borrado por cualquier autenticado

**Archivo:** `database.rules.json:21-25` (antes del fix)
**Vector:** `.write: "auth != null && (!data.exists() || !newData.exists())"` permitía a cualquier usuario autenticado eliminar códigos de salas ajenas. DoS: enumerar y borrar en bucle.

**Fix aplicado:** Borrado restringido al dueño del room (`root.child('rooms').child(data.val()).child('players/p1/uid').val() === auth.uid`). Creación sigue libre porque hace falta para crear partidas nuevas.

## Hallazgos medios — Resiliencia

### F12 — `localStorage.setItem` sin try/catch (QuotaExceededError)

**Archivo:** `js/learn.js:14` (antes del fix)
**Vector:** `QuotaExceededError` (modo privado, almacenamiento lleno, iOS Safari ITP) crashea el flujo de finalización de lección. Otros sitios potencialmente afectados: `leaderboard.js:14`, `app.jsx:167`. Sólo el path canónico de `learn.js` se parchea aquí.

**Fix aplicado:** Helper `safeSetItem(key, value)` con try/catch + toast opcional vía `window.stToast`.

**Tests:** `tests/learn.test.js` → "addXp — storage failure resilience".

### F13 — `joinQueue` no es transaccional (race en matchmaking) — DEUDA

**Archivo:** `js/rivals.js:305-345`
**Vector:** `get → remove → set` sobre `queue/` no es atómico. Dos clientes que entran simultáneamente pueden parear ambos con el mismo `oppUid` y crear dos rooms distintos.

**Estado:** No parcheado en este PR. El fix correcto requiere `runTransaction` (sobre el nodo queue) o mover el matchmaking a una Cloud Function. Cambio estructural fuera del scope de QA puro. Documentado para sprint dedicado.

## Cosas que NO son hallazgos (falsos positivos del recon inicial)

Durante la fase de exploración aparecieron candidatos que descarté tras leer
el código directamente:

- **`apiKey` de Firebase "expuesta"**: es público por diseño (Firebase docs).
  La defensa real es App Check (ya documentado en `security-checklist.md`).
- **`lesson.jsx` timer interval con leak**: el `clearInterval` en cleanup
  ya está bien; el problema real era el `setTimeout` (F5).
- **`saveOnboarding` guest upgrade hijack**: tras leer `auth.js`, el guest
  UID se reemplaza solo en memoria local; el write a Firestore es
  `setDoc(doc(db, 'users', user.uid))` que la regla ya restringe a
  `request.auth.uid === userId`. No hay vector real con las rules nuevas.

## Trabajo futuro priorizado

1. **App Check** (cubierto en `security-checklist.md` §2.1) — sin esto, F1/F2
   sólo defienden contra usuarios autenticados; bots con anonymous signin
   siguen pudiendo intentar.
2. **Cloud Function de validación de respuestas** para cerrar F4 al 100%.
3. **`runTransaction` en `joinQueue`** para cerrar F13.
4. **Reemplazo de Babel Standalone** por build pre-compilado (Vite/SWC) —
   habilita retirar `unsafe-eval` del CSP. Cubierto en `strategy.md` §5.
5. **Suite de tests con React Testing Library + JSDOM** para poder cubrir el
   doble-click race (F6) y el cleanup de timeout (F5) con tests directos —
   actualmente blindados sólo por inspección de código.

## Cómo verificar este PR

```bash
npm test                                    # 334 tests verde
firebase emulators:start --only firestore   # validar manualmente F1
firebase emulators:start --only database    # validar manualmente F3, F11
```

Pruebas manuales recomendadas (humano + navegador):

1. Abrir Speed round, doble-click rapidísimo en una respuesta → XP sube una sola vez.
2. Iniciar lección, abrir feedback, presionar Salir inmediatamente → no hay warning React en consola.
3. Inyectar un step `multi` sin `correct` vía devtools → CTA "Saltar" en vez de pantalla de error.
4. `localStorage.setItem('cq_learn_data', JSON.stringify({xp: 1e15})); addXp(10);` → siguiente write deja el total ≤ 10M.
5. Cambiar idioma, jugar con un nombre que contenga `$&` → texto literal, no expansión.
