// Stirio — Onboarding screen (aha-moment hook + multi-step profile collection)
// Depends on ui.jsx (useState, useEffect, Icon, StepTitle, confettiBurst,
// playChord, hapticTap), data.js, lang.js.
// Split from the former monolithic js/screens.jsx in the refactor tracked
// by PR #145. Classic Babel scripts share top-level scope, so downstream
// files can still read OnboardingHookStep / Onboarding by name as well as
// via window.Onboarding.


// ═══════════════ ONBOARDING ═══════════════
const ONBOARDING_LANGS = [
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'pt', label: 'Português',flag: '🇵🇹' },
  { id: 'de', label: 'Deutsch',  flag: '🇩🇪' },
];

const ONBOARDING_SPIRITS = [
  { id: 'gin',     emoji: '🌿' },
  { id: 'rum',     emoji: '🏝️' },
  { id: 'whisky',  emoji: '🥃' },
  { id: 'tequila', emoji: '🌵' },
  { id: 'vodka',   emoji: '❄️' },
  { id: 'brandy',  emoji: '🍇' },
];

// ── Aha-moment step: muestra valor antes de pedir nada.
// Paso inicial del onboarding (antes del selector de idioma + auth). En 15s
// el usuario ya ha interactuado con una ficha IBA y ha visto XP sumar,
// convirtiendo "prueba de esfuerzo" en "prueba de juego".
// Las 4 imágenes deben existir en ficha-images.js (ver verificación allí).
const ONBOARDING_HOOK_POOL = [
  { id: 'negroni',   name: 'Negroni' },
  { id: 'margarita', name: 'Margarita' },
  { id: 'mojito',    name: 'Mojito' },
  { id: 'daiquiri',  name: 'Daiquiri' },
];

const HOOK_FACTS = {
  negroni: {
    es: 'Tres partes iguales: gin, Campari y vermut rojo. Nació en Florencia en 1919.',
    en: 'Equal parts gin, Campari and sweet vermouth. Born in Florence, 1919.',
    fr: 'Parts égales de gin, Campari et vermouth rouge. Né à Florence en 1919.',
    pt: 'Partes iguais de gin, Campari e vermute doce. Nasceu em Florença em 1919.',
    de: 'Gleiche Teile Gin, Campari und roter Wermut. Entstand 1919 in Florenz.',
  },
  margarita: {
    es: 'Tequila, triple seco y zumo de lima. El clásico mexicano por excelencia.',
    en: 'Tequila, triple sec and lime juice. The Mexican classic.',
    fr: 'Tequila, triple sec et jus de citron vert. Le classique mexicain.',
    pt: 'Tequila, triple sec e suco de limão. O clássico mexicano.',
    de: 'Tequila, Triple Sec und Limettensaft. Der mexikanische Klassiker.',
  },
  mojito: {
    es: 'Ron blanco, menta fresca, azúcar, lima y soda. Cuba en un vaso.',
    en: 'White rum, fresh mint, sugar, lime and soda. Cuba in a glass.',
    fr: 'Rhum blanc, menthe fraîche, sucre, citron vert et soda. Cuba dans un verre.',
    pt: 'Rum branco, hortelã, açúcar, limão e soda. Cuba num copo.',
    de: 'Weißer Rum, frische Minze, Zucker, Limette und Soda. Kuba im Glas.',
  },
  daiquiri: {
    es: 'Ron blanco, lima y azúcar. El favorito de Hemingway en La Floridita.',
    en: 'White rum, lime and sugar. Hemingway\'s favourite at La Floridita.',
    fr: 'Rhum blanc, citron vert et sucre. Le préféré d\'Hemingway au Floridita.',
    pt: 'Rum branco, limão e açúcar. O preferido de Hemingway no Floridita.',
    de: 'Weißer Rum, Limette und Zucker. Hemingways Favorit im Floridita.',
  },
};

const HOOK_DONE_KEY = 'cq_onboarding_hook_v1';

const OnboardingHookStep = ({ language, onContinue }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [shuffled] = useState(() => [...ONBOARDING_HOOK_POOL].sort(() => Math.random() - 0.5));
  const [target] = useState(() => ONBOARDING_HOOK_POOL[Math.floor(Math.random() * ONBOARDING_HOOK_POOL.length)]);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'correct' | 'wrong' | 'timeup'
  const [pick, setPick] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (phase !== 'idle') return;
    if (timeLeft <= 0) { setPhase('timeup'); return; }
    const id = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  const grantXp = (amount, reason) => {
    try { window.stLearn?.addXp?.(amount, { reason }); } catch {}
  };

  const persistDone = () => {
    try { localStorage.setItem(HOOK_DONE_KEY, '1'); } catch {}
  };

  const handlePick = (opt, e) => {
    if (phase !== 'idle') return;
    setPick(opt.id);
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    if (opt.id === target.id) {
      setPhase('correct');
      try { hapticTap('win'); } catch {}
      try { confettiBurst(cx, cy); } catch {}
      try { playChord('major'); } catch {}
      grantXp(20, 'onboarding_hook_correct');
    } else {
      setPhase('wrong');
      try { hapticTap('bad'); } catch {}
      try { playChord('minor'); } catch {}
      grantXp(5, 'onboarding_hook_participation');
    }
  };

  const handleContinue = () => {
    if (phase === 'idle') grantXp(5, 'onboarding_hook_skip');
    persistDone();
    onContinue();
  };

  const targetFact = HOOK_FACTS[target.id]?.[language] || HOOK_FACTS[target.id]?.es || '';
  const revealed = phase !== 'idle';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'grid', placeItems: 'center',
      padding: '24px 20px', overflow: 'auto',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            fontSize: 48, marginBottom: 6,
            filter: 'drop-shadow(0 6px 20px var(--amber-glow))',
          }}>🍸</div>
          <h1 style={{
            fontFamily: 'var(--f-serif)', fontWeight: 400,
            fontSize: 'clamp(28px, 5.5vw, 36px)',
            margin: '0 0 4px', lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            {tr('onboarding.hook.prompt', '¿Cuál es un')}{' '}
            <span style={{ color: 'var(--amber)' }}>{target.name}</span>?
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '6px 0 12px' }}>
            {tr('onboarding.hook.subtitle', 'Toca la imagen. Tienes 15 segundos.')}
          </p>
          {!revealed && (
            <div style={{
              display: 'inline-block',
              fontFamily: 'var(--f-mono)',
              fontWeight: 600, fontSize: 22,
              color: timeLeft <= 5 ? 'var(--amber)' : 'var(--ink-2)',
              padding: '4px 14px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--bg-1)',
              border: '1px solid var(--line-soft)',
            }}>{timeLeft}s</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {shuffled.map(opt => {
            const img = window.getFichaImage?.(opt.name);
            const isTarget = opt.id === target.id;
            const isPicked = opt.id === pick;
            const border = revealed
              ? (isTarget ? '2px solid var(--amber)' : (isPicked ? '2px solid #e5484d' : '1px solid var(--line-soft)'))
              : '1px solid var(--line-soft)';
            return (
              <button key={opt.id} onClick={(e) => handlePick(opt, e)} disabled={revealed} style={{
                aspectRatio: '1 / 1',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                position: 'relative',
                border, background: 'var(--bg-1)', padding: 0,
                cursor: revealed ? 'default' : 'pointer',
                transition: 'border-color .2s, transform .15s',
                transform: revealed && isTarget ? 'scale(1.02)' : 'none',
              }}>
                {img ? (
                  <img src={img} alt="" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    opacity: revealed && !isTarget ? 0.35 : 1,
                    transition: 'opacity .3s',
                  }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'grid', placeItems: 'center',
                    fontSize: 48,
                  }}>🍸</div>
                )}
                {revealed && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '8px 10px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    color: '#fff', fontWeight: 600, fontSize: 12,
                    textAlign: 'left',
                  }}>{opt.name}</div>
                )}
                {revealed && isTarget && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--amber)', color: '#1a0d05',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 800, fontSize: 14,
                  }}>✓</div>
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div style={{
            marginTop: 16, padding: 14,
            background: 'var(--bg-1)', border: '1px solid var(--line-soft)',
            borderRadius: 'var(--r-md)',
            animation: 'rise .4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontWeight: 700, fontSize: 14, color: 'var(--amber)',
                fontFamily: 'var(--f-mono)', letterSpacing: '.02em',
              }}>
                {phase === 'correct' ? '+20 XP' : '+5 XP'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                {phase === 'correct' && tr('onboarding.hook.correct', '¡Bien visto!')}
                {phase === 'wrong'   && tr('onboarding.hook.wrong',   'Este era el de verdad.')}
                {phase === 'timeup'  && tr('onboarding.hook.timeup',  'El tiempo vuela.')}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{targetFact}</div>
          </div>
        )}

        <div style={{
          marginTop: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          minHeight: 44,
        }}>
          {!revealed ? (
            <button onClick={handleContinue} style={{
              background: 'transparent', border: 0,
              color: 'var(--ink-3)', fontSize: 12,
              padding: '6px 4px', cursor: 'pointer',
            }}>{tr('onboarding.hook.skip', 'Saltar')}</button>
          ) : <span />}
          {revealed && (
            <button onClick={handleContinue} style={{
              padding: '12px 22px',
              background: 'var(--amber)', color: '#1a0d05',
              borderRadius: 'var(--r-pill)', border: 0,
              fontWeight: 600, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              boxShadow: '0 6px 18px var(--amber-glow)',
            }}>
              {tr('onboarding.hook.continue', 'Continuar')} <Icon name="arrowR" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Onboarding = ({ onDone }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // Si el navegador ya tiene un idioma reconocido (lo persiste lang.js tras
  // auto-detectar), saltamos el step 0 (selector de idioma). El usuario puede
  // cambiarlo igualmente desde Perfil → Idioma sin volver al onboarding.
  const LANG_STORED = (() => {
    try { return !!localStorage.getItem('stirio_lang'); } catch { return false; }
  })();
  const STEP_OFFSET = LANG_STORED ? 1 : 0;
  const [step, setStep] = useState(STEP_OFFSET);
  const [authMode, setAuthMode] = useState(null); // 'google' | 'guest'
  const [name, setName] = useState('');
  const [level, setLevel] = useState(null);
  const [language, setLanguage] = useState(() => {
    try { return (window.stLang?.getLang?.()) || 'es'; } catch { return 'es'; }
  });
  const [alcohol, setAlcohol] = useState(null);    // 'regular' | 'mocktails'
  const [favSpirit, setFavSpirit] = useState(null);
  const [googleUser, setGoogleUser] = useState(null); // {uid,name,email,photo} from Firebase
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  // Email flow: 'idle' hides the form; 'signup' / 'signin' show it with the
  // matching mode. Inputs live in the same component so back/forward preserves.
  const [emailMode, setEmailMode] = useState('idle'); // 'idle' | 'signup' | 'signin'
  const [emailAddr, setEmailAddr] = useState('');
  const [emailPass, setEmailPass] = useState('');
  const [emailName, setEmailName] = useState('');
  const [hookDone, setHookDone] = useState(() => {
    try { return localStorage.getItem(HOOK_DONE_KEY) === '1'; } catch { return false; }
  });

  const handleGoogle = async () => {
    setAuthError(null);
    if (!window.stAuth) { setAuthError(tr('onboarding.auth_unavailable', 'Auth no disponible')); return; }
    setAuthLoading(true);
    try {
      await window.stAuth.initFirebase();
      const user = await window.stAuth.signInWithGoogle();
      setGoogleUser(user);
      setAuthMode('google');
      setName(user.name || '');
      setStep(2);
    } catch (e) {
      console.warn('[auth] google', e);
      setAuthError(e.code === 'auth/popup-closed-by-user' ? tr('onboarding.auth_cancel', 'Cancelaste el login') : tr('onboarding.auth_error', 'Error al iniciar con Google'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuest = () => {
    setAuthError(null);
    if (window.stAuth) { try { window.stAuth.signInAsGuest(); } catch {} }
    setAuthMode('guest');
    setStep(2);
  };

  const applyLanguage = (code) => {
    setLanguage(code);
    try { window.stLang?.setLang?.(code); } catch {}
    try { window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: code } })); } catch {}
  };

  const openEmail = (mode) => {
    setAuthError(null);
    setEmailMode(mode);
  };

  const emailErrorMessage = (e) => {
    const code = e?.code || '';
    if (code === 'auth/email-already-in-use') return tr('onboarding.email_taken', 'Ese email ya está registrado — inicia sesión.');
    if (code === 'auth/invalid-email')        return tr('onboarding.email_invalid', 'Email no válido.');
    if (code === 'auth/weak-password')        return tr('onboarding.email_weak', 'La contraseña debe tener al menos 6 caracteres.');
    if (code === 'auth/user-not-found')       return tr('onboarding.email_not_found', 'No existe una cuenta con ese email.');
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
      return tr('onboarding.email_wrong_password', 'Contraseña incorrecta.');
    if (code === 'auth/too-many-requests')    return tr('onboarding.email_rate_limit', 'Demasiados intentos — prueba más tarde.');
    return tr('onboarding.email_error', 'No se pudo completar el acceso.');
  };

  const submitEmail = async () => {
    setAuthError(null);
    if (!window.stAuth) { setAuthError(tr('onboarding.auth_unavailable', 'Auth no disponible')); return; }
    if (!emailAddr.trim() || !emailPass) { setAuthError(tr('onboarding.email_required', 'Rellena email y contraseña.')); return; }
    if (emailPass.length < 6) { setAuthError(tr('onboarding.email_weak', 'La contraseña debe tener al menos 6 caracteres.')); return; }
    setAuthLoading(true);
    try {
      await window.stAuth.initFirebase();
      const user = emailMode === 'signup'
        ? await window.stAuth.signUpWithEmail(emailAddr, emailPass, emailName)
        : await window.stAuth.signInWithEmail(emailAddr, emailPass);
      setAuthMode('email');
      setName(user.name || emailName || '');
      setEmailMode('idle');
      setEmailPass('');
      setStep(2);
    } catch (e) {
      console.warn('[auth] email', e);
      setAuthError(emailErrorMessage(e));
    } finally {
      setAuthLoading(false);
    }
  };

  const sendReset = async () => {
    if (!emailAddr.trim()) { setAuthError(tr('onboarding.email_required_reset', 'Escribe tu email para recibir el enlace.')); return; }
    if (!window.stAuth?.sendPasswordReset) return;
    setAuthLoading(true);
    try {
      await window.stAuth.initFirebase();
      await window.stAuth.sendPasswordReset(emailAddr);
      setAuthError(tr('onboarding.email_reset_sent', 'Te enviamos un email para restablecer tu contraseña.'));
    } catch (e) {
      setAuthError(emailErrorMessage(e));
    } finally {
      setAuthLoading(false);
    }
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(STEP_OFFSET, s - 1));

  // Número máximo de pasos lógicos (índice máximo + 1). Visualmente el
  // progress bar muestra (totalSteps - STEP_OFFSET) puntos cuando se saltó
  // el step 0 para que "x de 6" sea coherente con lo que el usuario ve.
  const totalSteps = 6;
  const visibleSteps = totalSteps - STEP_OFFSET;
  const canNext = {
    0: !!language,           // language picker (now the first step)
    1: true,                 // auth step advances via its own buttons
    2: authMode === 'google' || authMode === 'email' || (authMode === 'guest' && name.trim().length > 0),
    3: level !== null,
    4: alcohol !== null,     // regular vs mocktails
    5: true,                 // favSpirit optional
  }[step];

  const submit = () => onDone({
    name: authMode === 'google' ? (googleUser?.name || name) : name,
    email: googleUser?.email || null,
    photoURL: googleUser?.photo || null,
    uid: googleUser?.uid || null,
    authMode,
    onboarding: {
      difficulty: level || 'skip',
      language,
      alcohol: alcohol || 'regular',
      favSpirit: favSpirit || null,
    },
  });

  // Aha-moment primero: valida la propuesta antes de pedir idioma/auth.
  // Una vez visto se persiste en localStorage para no repetirlo si el
  // usuario abandona a mitad de flujo y vuelve.
  if (!hookDone) {
    return <OnboardingHookStep language={language} onContinue={() => setHookDone(true)} />;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'grid', placeItems: 'center',
      padding: '24px 20px',
      overflow: 'auto',
    }}>
      <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 2 }}>
        {step !== 1 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
            {Array.from({ length: visibleSteps }).map((_, i) => {
              const displayed = step - STEP_OFFSET;
              return (
                <div key={i} style={{
                  width: displayed === i ? 28 : 8, height: 8, borderRadius: 99,
                  background: i <= displayed ? 'var(--amber)' : 'var(--bg-3)',
                  transition: 'all .3s',
                  boxShadow: displayed === i ? '0 0 10px var(--amber-glow)' : 'none',
                }} />
              );
            })}
          </div>
        )}

        <div key={step} style={{ animation: 'rise .4s ease' }}>
          {step === 0 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{
                  fontSize: 64, margin: '0 auto 10px',
                  filter: 'drop-shadow(0 6px 24px var(--amber-glow))',
                }}>🌐</div>
                <h1 style={{
                  fontFamily: 'var(--f-serif)', fontWeight: 400,
                  fontSize: 'clamp(34px, 6vw, 44px)',
                  margin: '0 0 4px', lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  Stirio<span style={{ color: 'var(--amber)' }}>.</span>
                </h1>
              </div>
              <StepTitle
                eyebrow={tr('onboarding.lang_eyebrow', 'idioma')}
                title={tr('onboarding.lang_title', '¿En qué idioma prefieres Stirio?')}
                subtitle={tr('onboarding.lang_subtitle', 'Puedes cambiarlo luego desde Perfil.')}
              />
              <div style={{ display: 'grid', gap: 10 }}>
                {ONBOARDING_LANGS.map(l => {
                  const picked = language === l.id;
                  return (
                    <button key={l.id} onClick={() => applyLanguage(l.id)} style={{
                      padding: 14,
                      display: 'flex', alignItems: 'center', gap: 14,
                      textAlign: 'left',
                      borderRadius: 'var(--r-md)',
                      background: picked ? 'var(--amber-soft)' : 'var(--bg-1)',
                      border: `1px solid ${picked ? 'var(--amber)' : 'var(--line-soft)'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 26 }}>{l.flag}</div>
                      <div style={{ flex: 1, fontWeight: 500, fontSize: 15 }}>{l.label}</div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${picked ? 'var(--amber)' : 'var(--ink-3)'}`,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {picked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 88, margin: '0 auto 14px',
                filter: 'drop-shadow(0 8px 30px var(--amber-glow))',
                animation: 'pop .6s cubic-bezier(.2,1.4,.3,1)',
              }}>🍸</div>
              <h1 style={{
                fontFamily: 'var(--f-serif)', fontWeight: 400,
                fontSize: 'clamp(56px, 9vw, 84px)',
                margin: '0 0 6px', lineHeight: 0.95,
                letterSpacing: '-0.02em',
              }}>
                Stirio<span style={{ color: 'var(--amber)' }}>.</span>
              </h1>
              <p style={{
                fontFamily: 'var(--f-serif)', fontStyle: 'italic',
                fontSize: 20, color: 'var(--ink-2)',
                margin: '0 0 4px',
              }}>
                {tr('login.tagline', 'Domina el arte del cóctel.')}
              </p>
              <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.14em', marginBottom: 36 }}>
                {tr('login.sub', 'Aprende · Juega · Compite')}
              </div>

              <div style={{ display: 'grid', gap: 10, maxWidth: 340, margin: '0 auto' }}>
                <button
                  onClick={handleGoogle}
                  disabled={authLoading}
                  style={{
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: '#fff', color: '#1a1a1a',
                    borderRadius: 'var(--r-pill)',
                    border: 0, fontWeight: 500, fontSize: 14,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    opacity: authLoading ? 0.7 : 1,
                    cursor: authLoading ? 'wait' : 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {authLoading ? tr('ui.loading', 'Cargando…') : tr('login.google', 'Continuar con Google')}
                </button>
                <button
                  onClick={() => openEmail('signup')}
                  className="btn"
                  disabled={authLoading}
                  style={{ padding: '14px 18px' }}
                >
                  ✉️ {tr('login.email', 'Continuar con email')}
                </button>
                <button
                  onClick={handleGuest}
                  className="btn ghost"
                  disabled={authLoading}
                  style={{ padding: '14px 18px' }}
                >
                  <Icon name="user" size={16} /> {tr('login.guest', 'Continuar como invitado')}
                </button>
                {authError && (
                  <div style={{
                    padding: 10, borderRadius: 8, fontSize: 12,
                    background: 'color-mix(in oklch, var(--red) 20%, var(--bg-2))',
                    color: 'var(--ink-1)', textAlign: 'center',
                  }}>{authError}</div>
                )}
              </div>

              {emailMode !== 'idle' && (
                <div
                  onClick={(e) => { if (e.target === e.currentTarget) { setEmailMode('idle'); setAuthError(null); } }}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 60,
                    background: 'oklch(0.05 0 0 / 0.7)',
                    display: 'grid', placeItems: 'center',
                    padding: 20,
                  }}
                >
                  <form
                    onSubmit={(e) => { e.preventDefault(); submitEmail(); }}
                    style={{
                      width: '100%', maxWidth: 380,
                      background: 'var(--bg-1)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-md)',
                      padding: 22,
                      display: 'grid', gap: 12,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 24, textAlign: 'center' }}>
                      {emailMode === 'signup'
                        ? tr('onboarding.email_title_signup', 'Crea tu cuenta')
                        : tr('onboarding.email_title_signin', 'Inicia sesión')}
                    </div>
                    {emailMode === 'signup' && (
                      <input
                        placeholder={tr('onboarding.email_name_placeholder', 'Tu nombre')}
                        value={emailName}
                        onChange={e => setEmailName(e.target.value)}
                        autoComplete="name"
                        style={{
                          padding: '12px 14px', fontSize: 14,
                          background: 'var(--bg-2)', border: '1px solid var(--line)',
                          borderRadius: 8, color: 'var(--ink-0)', outline: 'none',
                        }}
                      />
                    )}
                    <input
                      type="email"
                      placeholder={tr('onboarding.email_placeholder', 'tu@email.com')}
                      value={emailAddr}
                      onChange={e => setEmailAddr(e.target.value)}
                      autoComplete="email"
                      style={{
                        padding: '12px 14px', fontSize: 14,
                        background: 'var(--bg-2)', border: '1px solid var(--line)',
                        borderRadius: 8, color: 'var(--ink-0)', outline: 'none',
                      }}
                    />
                    <input
                      type="password"
                      placeholder={tr('onboarding.email_password_placeholder', 'Contraseña (mín. 6)')}
                      value={emailPass}
                      onChange={e => setEmailPass(e.target.value)}
                      autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                      style={{
                        padding: '12px 14px', fontSize: 14,
                        background: 'var(--bg-2)', border: '1px solid var(--line)',
                        borderRadius: 8, color: 'var(--ink-0)', outline: 'none',
                      }}
                    />
                    {authError && (
                      <div style={{
                        padding: 10, borderRadius: 8, fontSize: 12,
                        background: 'color-mix(in oklch, var(--red) 20%, var(--bg-2))',
                        color: 'var(--ink-1)', textAlign: 'center',
                      }}>{authError}</div>
                    )}
                    <button type="submit" className="btn primary" disabled={authLoading} style={{ padding: '12px 18px' }}>
                      {authLoading
                        ? tr('ui.loading', 'Cargando…')
                        : (emailMode === 'signup'
                          ? tr('onboarding.email_cta_signup', 'Crear cuenta')
                          : tr('onboarding.email_cta_signin', 'Entrar'))}
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--f-mono)' }}>
                      <button
                        type="button"
                        onClick={() => { setEmailMode(emailMode === 'signup' ? 'signin' : 'signup'); setAuthError(null); }}
                        style={{ background: 'none', border: 0, color: 'var(--amber)', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {emailMode === 'signup'
                          ? tr('onboarding.email_switch_signin', 'Ya tengo cuenta')
                          : tr('onboarding.email_switch_signup', 'Crear cuenta nueva')}
                      </button>
                      {emailMode === 'signin' && (
                        <button
                          type="button"
                          onClick={sendReset}
                          style={{ background: 'none', border: 0, color: 'var(--ink-3)', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {tr('onboarding.email_forgot', 'Olvidé mi contraseña')}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEmailMode('idle'); setAuthError(null); }}
                      style={{ background: 'none', border: 0, color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--f-mono)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {tr('ui.cancel', 'Cancelar')}
                    </button>
                  </form>
                </div>
              )}
              <div style={{
                marginTop: 22, maxWidth: 340, margin: '22px auto 0',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-2)',
                border: '1px dashed var(--line)',
                fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)',
                lineHeight: 1.5,
              }}>
                {tr('login.note', 'Inicia con Google para guardar tus puntuaciones y aparecer en el ranking global.')}
              </div>
            </div>
          )}

          {step === 2 && authMode === 'guest' && (
            <div>
              <StepTitle eyebrow={tr('onboarding.handle_eyebrow', 'tu handle')} title={tr('onboarding.handle_title', '¿Cómo te llamamos?')} subtitle={tr('onboarding.handle_subtitle', 'Aparecerá en duelos y en la tabla global.')} />
              <input
                autoFocus
                placeholder={tr('onboarding.alias_placeholder', 'tu alias')}
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  fontSize: 24,
                  fontFamily: 'var(--f-serif)',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                  transition: 'border .2s, box-shadow .2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--amber)'; e.target.style.boxShadow = '0 0 0 4px var(--amber-soft)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          {step === 2 && (authMode === 'google' || authMode === 'email') && (
            <div style={{ textAlign: 'center' }}>
              {googleUser?.photo ? (
                <img src={googleUser.photo} alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    margin: '0 auto 14px', objectFit: 'cover',
                    boxShadow: '0 0 30px var(--amber-glow)',
                  }}/>
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  margin: '0 auto 14px',
                  background: 'linear-gradient(135deg, var(--amber), var(--berry))',
                  display: 'grid', placeItems: 'center',
                  fontSize: 32, fontWeight: 600, color: 'var(--bg-0)',
                  boxShadow: '0 0 30px var(--amber-glow)',
                }}>{(googleUser?.name || '?').charAt(0).toUpperCase()}</div>
              )}
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 32, marginBottom: 4 }}>
                {window.stLang && window.stLang.t
                  ? window.stLang.t('onboarding.google_hello', { name: googleUser?.name || tr('home.guest', 'invitado') })
                  : `¡Hola, ${googleUser?.name || tr('home.guest', 'invitado')}!`}
              </div>
              {googleUser?.email && (
                <div style={{ color: 'var(--ink-2)', marginBottom: 6 }}>{googleUser.email}</div>
              )}
              <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10, letterSpacing: '0.12em' }}>
                {tr('onboarding.google_session', '· sesión iniciada con google ·')}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <StepTitle eyebrow={tr('onboarding.level_eyebrow', 'nivel')} title={tr('onboarding.level_title', '¿Qué tal te llevas con la coctelería?')} subtitle={tr('onboarding.level_subtitle', 'Ajustamos la dificultad. Puedes cambiarlo cuando quieras.')} />
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { id: 'rookie', label: tr('onboarding.level_rookie', 'Soy nuevo'), caption: tr('onboarding.level_rookie_cap', 'Empezamos por lo clásico'), emoji: '🌱' },
                  { id: 'home', label: tr('onboarding.level_home', 'Bartender casero'), caption: tr('onboarding.level_home_cap', 'Conozco lo básico, quiero más'), emoji: '🏠' },
                  { id: 'pro', label: tr('onboarding.level_pro', 'Pro / curioso serio'), caption: tr('onboarding.level_pro_cap', 'Dame historia, técnica y retos'), emoji: '🥃' },
                ].map(g => {
                  const picked = level === g.id;
                  return (
                    <button key={g.id} onClick={() => setLevel(g.id)} style={{
                      padding: 16,
                      display: 'flex', alignItems: 'center', gap: 14,
                      textAlign: 'left',
                      borderRadius: 'var(--r-md)',
                      background: picked ? 'var(--amber-soft)' : 'var(--bg-1)',
                      border: `1px solid ${picked ? 'var(--amber)' : 'var(--line-soft)'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 28 }}>{g.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 15 }}>{g.label}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                          {g.caption}
                        </div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${picked ? 'var(--amber)' : 'var(--ink-3)'}`,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {picked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setLevel('skip'); }}
                style={{
                  marginTop: 14, width: '100%', padding: 10,
                  background: 'transparent', border: 0,
                  color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 12,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}
              >
                {tr('onboarding.skip', 'Saltar — decidir luego')}
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <StepTitle eyebrow={tr('onboarding.alcohol_eyebrow', 'preferencia')} title={tr('onboarding.alcohol_title', '¿Bebes alcohol?')} subtitle={tr('onboarding.alcohol_subtitle', 'Adaptamos las recetas que te sugerimos.')} />
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { id: 'regular',   emoji: '🍸' },
                  { id: 'mocktails', emoji: '🍹' },
                ].map(a => {
                  const picked = alcohol === a.id;
                  return (
                    <button key={a.id} onClick={() => setAlcohol(a.id)} style={{
                      padding: 16,
                      display: 'flex', alignItems: 'center', gap: 14,
                      textAlign: 'left',
                      borderRadius: 'var(--r-md)',
                      background: picked ? 'var(--amber-soft)' : 'var(--bg-1)',
                      border: `1px solid ${picked ? 'var(--amber)' : 'var(--line-soft)'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 28 }}>{a.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 15 }}>
                          {tr(`onboarding.alcohol_${a.id}`)}
                        </div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                          {tr(`onboarding.alcohol_${a.id}_cap`)}
                        </div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${picked ? 'var(--amber)' : 'var(--ink-3)'}`,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {picked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <StepTitle eyebrow={tr('onboarding.spirit_eyebrow', 'destilado')} title={tr('onboarding.spirit_title', '¿Tu destilado favorito?')} subtitle={tr('onboarding.spirit_subtitle', 'Lo usaremos para sugerirte recetas.')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {ONBOARDING_SPIRITS.map(s => {
                  const picked = favSpirit === s.id;
                  return (
                    <button key={s.id} onClick={() => setFavSpirit(picked ? null : s.id)} style={{
                      padding: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      textAlign: 'center',
                      borderRadius: 'var(--r-md)',
                      background: picked ? 'var(--amber-soft)' : 'var(--bg-1)',
                      border: `1px solid ${picked ? 'var(--amber)' : 'var(--line-soft)'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 28 }}>{s.emoji}</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {tr(`onboarding.spirit.${s.id}`)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setFavSpirit(null)}
                style={{
                  marginTop: 14, width: '100%', padding: 10,
                  background: 'transparent', border: 0,
                  color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 12,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}
              >
                {tr('onboarding.spirit_none', 'Prefiero no decir')}
              </button>
            </div>
          )}
        </div>

        {step !== 1 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 0 && (
              <button className="btn" onClick={back} style={{ padding: '12px 18px' }}>
                <Icon name="arrowL" size={16} /> {tr('ui.back', 'Atrás')}
              </button>
            )}
            <button
              className="btn primary"
              onClick={step === totalSteps - 1 ? submit : next}
              disabled={!canNext}
              style={{
                flex: 1, padding: '12px 24px',
                opacity: canNext ? 1 : 0.4,
                pointerEvents: canNext ? 'auto' : 'none',
              }}
            >
              {step === totalSteps - 1 ? tr('onboarding.enter', 'Entrar a Stirio') : tr('ui.continue', 'Continuar')} <Icon name="arrowR" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { Onboarding });
