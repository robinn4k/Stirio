# Stirio — Checklist de seguridad

Documento operativo de los controles de seguridad que hoy están en el repo y
los que requieren acción en consola de Firebase. Complementa el análisis
estratégico en [`strategy.md`](./strategy.md).

## 1. Aplicado en este repo (Sprint 1)

### 1.1 Content Security Policy vía meta tag

Añadida en `index.html` como `<meta http-equiv="Content-Security-Policy">`.

- **`'unsafe-eval'` y `'unsafe-inline'`** siguen siendo necesarios mientras
  Babel Standalone transpile JSX en el navegador. La migración a Vite/SWC
  (ver `strategy.md` §5 Sprint 1-2) permitirá retirarlos.
- **`frame-ancestors`, `report-uri`, `report-to`** no son válidos en `<meta>`
  CSP — solo funcionan como cabeceras HTTP. Cuando se migre a Cloudflare
  Pages (ver `strategy.md` §1.3), añadirlos en un `_headers` file.
- Dominios autorizados: unpkg + jsdelivr + gstatic (Firebase) + images.unsplash
  + `*.googleusercontent.com`. Cualquier host adicional que se añada a la app
  debe reflejarse también aquí o será bloqueado en tiempo de ejecución.

Validación manual: abrir DevTools → Console tras deploy y buscar `Refused to
load`. Si aparece algo legítimo, ampliar la directiva correspondiente.

### 1.2 Subresource Integrity (SRI)

Hashes SHA-384 añadidos a los tres scripts de `unpkg` (React, ReactDOM, Babel
Standalone). Si la CDN sirviera un bundle modificado, el navegador lo rechaza.

**Al subir de versión de cualquiera de los tres:**

```bash
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.development.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" \
  "https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"; do
  printf '%s\n  sha384-' "$url"
  curl -sSL "$url" | openssl dgst -sha384 -binary | openssl base64 -A
  printf '\n'
done
```

Pegar el nuevo hash en el atributo `integrity` correspondiente en
`index.html`. Recordar bumpear `STATIC_CACHE_VERSION` en `sw.js` (el pre-commit
hook lo hace automáticamente si `index.html` está en `CACHE_PATHS`).

### 1.3 `firestore.rules` versionadas

Antes no existían en el repo — vivían solo en la consola. Ahora el archivo
documenta el estado deseado. **Deploy manual requerido:**

```bash
firebase deploy --only firestore:rules
```

Antes de desplegar, comparar con la consola
(https://console.firebase.google.com/project/dblearn-45fcc/firestore/rules)
y probar con el emulador:

```bash
firebase emulators:start --only firestore
```

## 2. Acción pendiente — requiere consola o decisión humana

### 2.1 Firebase App Check (prioridad alta)

Sin App Check, cualquier bot con un anonymous signin puede inflar el
leaderboard y consumir cuota. Es la defensa más importante pendiente.

**Pasos en la consola (≈10 min):**

1. https://console.firebase.google.com/project/dblearn-45fcc/appcheck
2. Registrar la web app con el proveedor **reCAPTCHA v3**
   (Enterprise si el presupuesto lo permite, v3 estándar si no).
3. Copiar la **site key**.
4. Añadir en `js/firebase-config.js` justo después de `initializeApp`:

   ```javascript
   import { initializeAppCheck, ReCaptchaV3Provider } from
     'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js';

   initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('<SITE_KEY>'),
     isTokenAutoRefreshEnabled: true
   });
   ```

5. Desplegar y monitorizar en la consola durante 7 días en modo **unenforced**
   — confirma que todas las llamadas legítimas llevan token.
6. Pasar a **enforced** para Firestore, RTDB y Storage.

Considerar usar una segunda site key para `localhost` / dev.

### 2.2 Debilidades detectadas en `database.rules.json` (RTDB multiplayer)

**NO parcheadas en este PR** — cambiar RTDB rules sin pruebas de extremo a
extremo puede romper matchmaking en producción. Propuesta de revisión para
un sprint dedicado:

1. **`rooms/$roomId`** (línea 18): la condición
   `data.child('status').val() === 'waiting'` permite a cualquier usuario
   autenticado sobrescribir la sala entera mientras esté en espera. Intent era
   "permitir unirse"; en realidad permite corrupción.
   - **Fix propuesto**: separar `.write` en `.validate` + restringir a
     `newData.child('players/p2/uid').val() === auth.uid` (o p3/p4) cuando se
     une, es decir, solo puedes escribir tu propio slot.

2. **`matched/$uid`** (línea 28): el OR `!data.exists()` permite que cualquier
   usuario cree el registro `matched/{otro_uid}`. Es intencional (rendez-vous,
   ver `js/rivals.js:333`), pero permite spam del canal de notificación.
   - **Fix propuesto**: `.validate` que obligue a `{roomId: string, size<=64}`
     y `TTL` por servidor timestamp para auto-expirar.

3. **`queue` parent `.read`** (línea 10): cualquier autenticado puede listar
   la cola entera de matchmaking. Fuga de información de presencia.
   - **Fix propuesto**: quitar `.read` en el nivel padre; dejar solo
     `$uid/.read: auth.uid === $uid`. El matchmaking server-side ya no
     necesitaría ver toda la cola (requiere mover la lógica a una Cloud
     Function, cambio estructural).

4. **`presence` parent `.read`**: mismo patrón. Si se quiere privacidad,
   restringir.

5. **Sin `.validate` en ningún nodo**: todos los paths aceptan cualquier JSON.
   Un cliente malicioso puede escribir MBs de basura.

Prioridad: (1) y (2) son las más críticas; (3)-(5) son hardening progresivo.

### 2.3 Guest mode y leaderboard

Revisar que los usuarios anónimos (guest signin) no puedan escribir al
leaderboard global, o si pueden, que su score quede marcado como guest
(ya existe `isGuest` en el entry, pero ninguna rule lo valida).

Opciones:
- (A) Denegar write a guests en `firestore.rules`:
  `request.auth.token.firebase.sign_in_provider != 'anonymous'`.
- (B) Permitir pero filtrar guests del leaderboard público
  (ya se hace parcialmente client-side).

### 2.4 Migración a Cloudflare Pages (mejora estructural)

GitHub Pages no permite cabeceras HTTP personalizadas. Mover a Cloudflare
Pages (o Firebase Hosting con `firebase.json > hosting > headers`) habilita:

- `Content-Security-Policy` con `frame-ancestors 'none'` y `report-to`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Content-Type-Options: nosniff`

## 3. Ritmo de revisión

- **Cada deploy**: verificar DevTools sin errores CSP/SRI.
- **Mensual**: revisar métricas de App Check en consola (si activo).
- **Trimestral**: rotar site keys de reCAPTCHA si hay sospecha de filtración.
- **En cada bump de React/Babel**: regenerar SRI hashes con el snippet de §1.2.
