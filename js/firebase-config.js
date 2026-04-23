/**
 * FIREBASE CONFIGURATION
 * =====================
 * Para activar Firebase (guardado en la nube + ranking global):
 *
 * 1. Ve a https://console.firebase.google.com y crea un proyecto
 * 2. En "Authentication" → "Sign-in method" → activa "Google" (es gratis)
 * 3. En "Firestore Database" → crea la base de datos en modo producción
 * 4. En "Configuración del proyecto" (icono ⚙️) → "Tus apps" → botón "</>  Web"
 *    → ponle un nombre → verás un bloque de código con firebaseConfig → copia
 *    los valores y pégalos abajo reemplazando los YOUR_...
 * 5. Cambia FIREBASE_ENABLED = false  →  FIREBASE_ENABLED = true
 * 6. En Firestore → "Reglas" → pega esto y publica:
 *
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /scores/{scoreId} {
 *          allow read: if true;
 *          allow write: if request.auth != null;
 *        }
 *        match /users/{userId} {
 *          allow read, write: if request.auth != null && request.auth.uid == userId;
 *        }
 *      }
 *    }
 */

export const firebaseConfig = {
  apiKey: "AIzaSyDgbIK3WTkUI2Yo0FiMAv3nEYAvj6L25ow",
  authDomain: "dblearn-45fcc.firebaseapp.com",
  databaseURL: "https://dblearn-45fcc-default-rtdb.firebaseio.com",
  projectId: "dblearn-45fcc",
  storageBucket: "dblearn-45fcc.firebasestorage.app",
  messagingSenderId: "111717730902",
  appId: "1:111717730902:web:28987b3af458093eb849f7",
  measurementId: "G-Y8K9C8RKPM"
};

export const FIREBASE_ENABLED = true;

/**
 * Google Identity Services (GIS) OAuth 2.0 Web Client ID.
 *
 * Cómo obtenerlo:
 * 1. https://console.cloud.google.com/apis/credentials?project=dblearn-45fcc
 * 2. Bajo "OAuth 2.0 Client IDs" busca "Web client (auto-created by
 *    Google Service)" o el cliente que creó Firebase al habilitar Google
 *    sign-in. Tiene formato `111717730902-XXXXXXXX.apps.googleusercontent.com`.
 * 3. Copia el Client ID y pégalo abajo.
 * 4. En ese mismo cliente, añade el origen de la app a "Authorized
 *    JavaScript origins" (p.ej. `https://robinn4k.github.io`) y guarda.
 *
 * Con esto configurado, el login de Google usa el flujo GIS moderno que
 * funciona sin cookies de terceros. Si lo dejas vacío, la app cae al
 * flujo clásico signInWithPopup / signInWithRedirect (que puede fallar en
 * navegadores con 3P cookies bloqueadas).
 */
export const GOOGLE_OAUTH_CLIENT_ID = "111717730902-di8jmo881plbuveabpqrrgs5ku83db4k.apps.googleusercontent.com";
