// Stirio — Screens: Onboarding, Home, Profile
// Depends on ui.jsx, data.js

// ═══════════════ ONBOARDING ═══════════════
const Onboarding = ({ onDone }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState(null); // 'google' | 'guest'
  const [name, setName] = useState('');
  const [level, setLevel] = useState(null);
  const [googleUser, setGoogleUser] = useState(null); // {uid,name,email,photo} from Firebase
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

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
      setStep(1);
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
    setStep(1);
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  const totalSteps = 3;
  const canNext = {
    0: true,
    1: authMode === 'google' || (authMode === 'guest' && name.trim().length > 0),
    2: level !== null,
  }[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'grid', placeItems: 'center',
      padding: '24px 20px',
      overflow: 'auto',
    }}>
      <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 2 }}>
        {step > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: step === i ? 28 : 8, height: 8, borderRadius: 99,
                background: i <= step ? 'var(--amber)' : 'var(--bg-3)',
                transition: 'all .3s',
                boxShadow: step === i ? '0 0 10px var(--amber-glow)' : 'none',
              }} />
            ))}
          </div>
        )}

        <div key={step} style={{ animation: 'rise .4s ease' }}>
          {step === 0 && (
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
                  onClick={handleGuest}
                  className="btn"
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

          {step === 1 && authMode === 'guest' && (
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

          {step === 1 && authMode === 'google' && (
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

          {step === 2 && (
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
                Saltar — decidir luego
              </button>
            </div>
          )}
        </div>

        {step > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn" onClick={back} style={{ padding: '12px 18px' }}>
              <Icon name="arrowL" size={16} /> Atrás
            </button>
            <button
              className="btn primary"
              onClick={step === 2 ? () => onDone({
                name: authMode === 'google' ? (googleUser?.name || name) : name,
                email: googleUser?.email || null,
                photoURL: googleUser?.photo || null,
                uid: googleUser?.uid || null,
                authMode, level,
              }) : next}
              disabled={!canNext}
              style={{
                flex: 1, padding: '12px 24px',
                opacity: canNext ? 1 : 0.4,
                pointerEvents: canNext ? 'auto' : 'none',
              }}
            >
              {step === 2 ? tr('onboarding.enter', 'Entrar a Stirio') : tr('ui.continue', 'Continuar')} <Icon name="arrowR" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════ HOME ═══════════════
const Home = ({ profile, onPickLesson, onOpenProfile, onOpenMode }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // Real leaderboard preview
  const [leaderboardPreview, setLeaderboardPreview] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!window.stLeaderboard) return;
      try {
        const fn = window.stLeaderboard.fetchLeaderboard || window.stLeaderboard.getLeaderboard;
        if (!fn) return;
        const list = await fn();
        if (!cancelled && Array.isArray(list)) {
          const me = (window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser()) || null;
          setLeaderboardPreview(list.slice(0, 5).map(u => ({
            name: u.displayName || u.name || 'Player',
            xp: u.xpTotal || u.xp || 0,
            level: u.level || 1,
            self: me && (u.uid === me.uid),
          })));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  // Featured cocktail rotates daily: different lesson each calendar day,
  // cycling through LESSONS. Uses UTC day-of-epoch so everyone sees the
  // same featured on a given day.
  const _dayIdx = Math.floor(Date.now() / 86400000);
  const featured = LESSONS[_dayIdx % LESSONS.length] || LESSONS[0];
  const dailyChallenge = { id: 'daily', title: 'Reto Diario', questions: 10, xp: 120 };
  const time = new Date().getHours();
  const greetingKey = time < 12 ? 'home.greet_morning' : time < 19 ? 'home.greet_afternoon' : 'home.greet_evening';
  const greetingFallback = time < 12 ? 'Buenos días' : time < 19 ? 'Buenas tardes' : 'Buenas noches';
  const greeting = tr(greetingKey, greetingFallback);

  return (
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, marginBottom: 2 }}>
            {greeting}, {profile.name || tr('home.guest', 'invitado')}
          </div>
          <div style={{
            fontFamily: 'var(--f-serif)', fontSize: 30, fontWeight: 400,
            letterSpacing: '-0.02em',
          }}>
            Stirio<span style={{ color: 'var(--amber)' }}>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StreakBadge count={profile.streak} />
          <button className="btn ghost" onClick={onOpenProfile} style={{ padding: 6, borderRadius: '50%' }} aria-label="Profile">
            {(() => {
              const photo = profile.avatar || profile.photoURL;
              return (
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: photo ? 'transparent' : 'linear-gradient(135deg, var(--amber), var(--berry))',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 600, fontSize: 15, color: 'var(--bg-0)',
                  overflow: 'hidden',
                }}>
                  {photo
                    ? <img src={photo} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (profile.name || '?').slice(0, 1).toUpperCase()}
                </div>
              );
            })()}
          </button>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)',
          marginBottom: 6,
        }}>
          <span>{(window.stLang && window.stLang.t) ? window.stLang.t('profile.level_line', { level: profile.level, title: profile.title }) : `Nivel ${profile.level} · ${profile.title}`}</span>
          <span>{profile.xp} / {profile.xpNext} xp</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--line-soft)' }}>
          <div style={{
            width: `${(profile.xp / profile.xpNext) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--amber), oklch(0.86 0.17 60))',
            boxShadow: '0 0 14px var(--amber-glow)',
          }} />
        </div>
      </div>

      {/* hero: featured + daily challenge + duel */}
      <section style={{ marginBottom: 32 }}>
        <div className="mobile-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 14 }}>
          <FeaturedCard lesson={featured} onPlay={() => onPickLesson(featured)} />
          <div style={{ display: 'grid', gap: 14 }}>
            <DailyCard onPlay={() => onOpenMode('daily')} />
            <DuelCard onPlay={() => onOpenMode('duel')} />
          </div>
        </div>
      </section>

      {/* Academy */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.academy_eyebrow', 'aprende')} title={tr('academy.title_ui', 'Cocktail Academy')} action={<span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>0 / 6</span>} />
        <div className="card mobile-academy-hero" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center', background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))', borderColor: 'oklch(0.82 0.17 75 / 0.3)' }}>
          <div style={{ fontSize: 54, filter: 'drop-shadow(0 6px 20px var(--amber-glow))' }}>🎓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.1, marginBottom: 4 }}>{tr('home.academy_title', 'Aprende paso a paso')}</div>
            <div style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 10 }}>{tr('home.academy_sub', 'Domina las familias de cócteles — Sours, Highballs, Martinis, Tiki…')}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Sours', 'Highballs', 'Martinis', 'Old-school', 'Tiki', 'Modernos'].map((n, i) => (
                <div key={n} style={{
                  flex: 1, height: 6, borderRadius: 99,
                  background: i === 0 ? 'var(--amber)' : 'var(--bg-3)',
                  boxShadow: i === 0 ? '0 0 8px var(--amber-glow)' : 'none',
                }} />
              ))}
            </div>
          </div>
          <button className="btn primary" onClick={() => onOpenMode('academy')} style={{ padding: '12px 18px' }}>
            {tr('home.academy_cta', 'Abrir')} <Icon name="arrowR" size={14} />
          </button>
        </div>
      </section>

      {/* Quick modes */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.quick_eyebrow', 'jugar')} title={tr('home.quick_title', 'Modos rápidos')} />
        <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <ModeCard icon="⚡" title={tr('home.speed_title', 'Velocidad')} caption={tr('home.speed_caption', '60 segundos')} accent="amber" onClick={() => onOpenMode('speed')} />
          <ModeCard icon="🍹" title={tr('home.builder_title', 'Constructor')} caption={tr('home.builder_caption', 'Adivina por ingredientes')} accent="cyan" onClick={() => onOpenMode('builder')} />
          <ModeCard icon="👃" title={tr('home.blind_title', 'Cata a ciegas')} caption={tr('home.blind_caption', '35+ destilados')} accent="violet" onClick={() => onOpenMode('blind')} />
          <ModeCard icon="🎲" title={tr('home.freequiz_title', 'Quiz libre')} caption={tr('home.freequiz_caption', '24 rondas')} accent="berry" onClick={() => onOpenMode('freequiz')} />
        </div>
      </section>

      {/* Mini games + Arcade */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.arcade_eyebrow', 'arcade')} title={tr('home.arcade_title', 'Mini juegos')} />
        <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <ArcadeCard title={tr('home.arcade_coctelero', 'Arcade Coctelero')} subtitle={tr('home.arcade_coctelero_sub', 'Aprende recetas jugando')} icon="🕹️" onClick={() => onOpenMode('arcade')} />
          <ArcadeCard title={tr('home.memory_title', 'Memoria de Garnish')} subtitle={tr('home.memory_sub', 'Empareja guarniciones')} icon="🧠" onClick={() => onOpenMode('memory')} />
          <ArcadeCard title={tr('home.rhythm_title', 'Ritmo de Shaker')} subtitle={tr('home.rhythm_sub', 'Agita al compás')} icon="🥁" onClick={() => onOpenMode('rhythm')} />
        </div>
      </section>

      {/* Reference */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.ref_eyebrow', 'referencia')} title={tr('home.ref_title', 'Referencia rápida')} />
        <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <RefTile icon="📖" label={tr('home.ref_iba', 'Fichas IBA')} count="90" onClick={() => onOpenMode('iba')} />
          <RefTile icon="🌐" label={tr('home.ref_wiki', 'Enciclopedia')} count="∞" onClick={() => onOpenMode('wiki')} />
          <RefTile icon="📝" label={tr('home.ref_glossary', 'Glosario')} count="70+" onClick={() => onOpenMode('glossary')} />
          <RefTile icon="🗺️" label={tr('home.ref_map', 'Mapa destilados')} count="12" onClick={() => onOpenMode('map')} />
          <RefTile icon="📚" label={tr('home.ref_library', 'Biblioteca 3D')} count="24" onClick={() => onOpenMode('library')} />
        </div>
      </section>

      {/* Up next (60s) */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.queue_eyebrow', '60s queue')} title={tr('home.queue_title', 'Rondas de 60 segundos')} action={<button className="btn ghost" style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontSize: 11 }}><Icon name="shuffle" size={14} /> Aleatorio</button>} />
        <div className="mobile-grid-lessons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {LESSONS.map(l => <LessonCard key={l.id} lesson={l} onPlay={() => onPickLesson(l)} />)}
        </div>
      </section>

      {/* leaderboard preview */}
      <section>
        <SectionHeader eyebrow={tr('home.ranking_eyebrow', 'global')} title={tr('home.ranking', 'Ranking mundial')} action={<button className="btn ghost" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, padding: '6px 10px' }} onClick={onOpenProfile}>{tr('home.see_all', 'Ver todos →')}</button>} />
        <div className="card" style={{ padding: 4 }}>
          {(leaderboardPreview.length ? leaderboardPreview : []).map((p, i) => (
            <div key={`${p.name}-${i}`} style={{
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderRadius: 'var(--r-md)',
              background: p.self ? 'var(--amber-soft)' : 'transparent',
              border: p.self ? '1px solid oklch(0.82 0.17 75 / 0.4)' : '1px solid transparent',
            }}>
              <div style={{
                width: 24, textAlign: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600,
                color: i < 3 ? 'var(--amber)' : 'var(--ink-3)',
              }}>{i + 1}</div>
              <div style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: p.self ? 600 : 400 }}>{p.name}</span>
                <span style={{ marginLeft: 8, color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--f-mono)' }}>Lv {p.level}</span>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: p.self ? 'var(--amber)' : 'var(--ink-1)', fontWeight: 600 }}>
                {p.xp.toLocaleString()}
              </div>
            </div>
          ))}
          {leaderboardPreview.length === 0 && (
            <div style={{ padding: '14px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
              {tr('home.no_ranking', 'Juega una ronda para aparecer en el ranking')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, action }) => (
  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
    <div>
      <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, marginBottom: 2 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
    {action}
  </div>
);

// Fotos cinemáticas de Unsplash (source URL estable, recortes verticales)
const LESSON_IMAGES = {
  negroni: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=900&q=85&auto=format&fit=crop',
  espresso: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=900&q=85&auto=format&fit=crop',
  chord: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=900&q=85&auto=format&fit=crop',
  hemingway: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=85&auto=format&fit=crop',
  color: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900&q=85&auto=format&fit=crop',
  daily: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=85&auto=format&fit=crop',
};

const FeaturedCard = ({ lesson, onPlay }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const trP = (k, params, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k, params) : (f || k);
  const img = LESSON_IMAGES[lesson.id] || LESSON_IMAGES.negroni;
  return (
    <div className="card mobile-featured" style={{
      padding: 0, overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      minHeight: 260,
      border: '1px solid var(--line)',
      background: 'var(--bg-1)',
      position: 'relative',
    }}>
      <div className="mobile-featured-copy" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 8 }}>
            {trP('home.today_label', { difficulty: lesson.difficulty }, `hoy · ${lesson.difficulty}`)}
          </div>
          <h3 style={{
            fontFamily: 'var(--f-serif)', fontWeight: 400,
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            margin: '0 0 8px', lineHeight: 1.05, letterSpacing: '-0.02em',
          }}>
            {lesson.title}
          </h3>
          <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>{lesson.subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={onPlay} style={{ padding: '12px 22px' }}>
            <Icon name="play" size={14} /> {tr('home.play_60s', 'Jugar · 60s')}
          </button>
          <div className="chip amber"><Icon name="bolt" size={12} /> +{lesson.xp} xp</div>
        </div>
      </div>

      {/* Foto cinemática */}
      <div className="mobile-featured-art" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={img}
          alt={lesson.title}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.08) saturate(1.1)',
          }}
        />
        {/* Viñeta que funde la imagen hacia el panel de texto.
            En split (desktop) → fade a la izquierda.
            En stacked (mobile) → fade hacia abajo.
            Mantenemos ambos con pesos distintos. */}
        <div className="mobile-featured-fade" style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
        }} />
        {/* Tinte cálido sutil */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(120% 80% at 80% 30%, var(--amber-glow) 0%, transparent 50%)',
          mixBlendMode: 'overlay',
          opacity: 0.5,
        }} />
        {/* Grano */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-radial-gradient(circle at 20% 30%, transparent 0 2px, rgba(0,0,0,0.04) 2px 3px)',
          mixBlendMode: 'overlay',
          opacity: 0.7,
        }} />
      </div>
    </div>
  );
};

const DailyCard = ({ onPlay }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
  <button onClick={onPlay} className="card" style={{
    padding: 18, textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 8,
    background: 'linear-gradient(135deg, oklch(0.78 0.13 200 / 0.18), var(--bg-2))',
    borderColor: 'oklch(0.78 0.13 200 / 0.3)',
    minHeight: 112, transition: 'transform .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div className="mono caps" style={{ color: 'var(--cyan)', fontSize: 10 }}>{tr('home.daily_eyebrow', 'reto diario')}</div>
      <div style={{ fontSize: 22 }}>📅</div>
    </div>
    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.05 }}>{tr('home.daily_title', '10 preguntas frescas')}</div>
    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{tr('home.daily_sub', 'Nuevas cada día · +120 XP')}</div>
  </button>
  );
};

const DuelCard = ({ onPlay }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
  <button onClick={onPlay} className="card" style={{
    padding: 18, textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 8,
    background: 'linear-gradient(135deg, oklch(0.65 0.18 10 / 0.18), var(--bg-2))',
    borderColor: 'oklch(0.65 0.18 10 / 0.3)',
    minHeight: 112, transition: 'transform .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div className="mono caps" style={{ color: 'var(--berry)', fontSize: 10 }}>{tr('home.multiplayer', 'multiplayer')}</div>
      <div style={{ fontSize: 22 }}>⚔️</div>
    </div>
    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.05 }}>{tr('home.duel_sub_title', 'Duelo 1 vs 1')}</div>
    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{tr('duel.menu_join', 'Amigo')} · {tr('duel.menu_random', 'aleatorio')} · {tr('duel.menu_bot', 'bot')}</div>
  </button>
  );
};

const ModeCard = ({ icon, title, caption, accent, onClick }) => (
  <button onClick={onClick} className="card mobile-mode-card" style={{
    padding: 16, textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', transition: 'transform .15s, border-color .2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `var(--${accent})`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
  >
    <div className="mode-icon" style={{ fontSize: 32, filter: `drop-shadow(0 4px 10px var(--${accent}-glow, var(--amber-glow)))` }}>{icon}</div>
    <div>
      <h4 style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{title}</h4>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{caption}</div>
    </div>
  </button>
);

const ArcadeCard = ({ icon, title, subtitle, onClick }) => (
  <button onClick={onClick} className="card mobile-mode-card" style={{
    padding: 18, textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 10,
    transition: 'transform .15s, border-color .2s', minHeight: 132,
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--amber)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
  >
    <div style={{ fontSize: 40, filter: 'drop-shadow(0 6px 14px var(--amber-glow))' }}>{icon}</div>
    <div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20, lineHeight: 1.1, marginBottom: 3 }}>{title}</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{subtitle}</div>
    </div>
  </button>
);

const LessonCard = ({ lesson, onPlay }) => (
  <button onClick={onPlay} className="card" style={{
    padding: 16, textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 10,
    cursor: 'pointer', transition: 'transform .15s, border-color .2s',
    width: '100%',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `var(--${lesson.accent})`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div className="chip" style={{ padding: '3px 8px' }}>{lesson.category}</div>
      <div style={{ fontSize: 32, lineHeight: 1, filter: `drop-shadow(0 4px 12px var(--${lesson.accent}-glow, var(--amber-glow)))` }}>{lesson.emoji}</div>
    </div>
    <div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20, fontWeight: 400, lineHeight: 1.1, marginBottom: 4 }}>
        {lesson.title}
      </div>
      <div style={{ color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--f-mono)' }}>
        60s · +{lesson.xp} xp · {lesson.difficulty}
      </div>
    </div>
  </button>
);

const RefTile = ({ icon, label, count, onClick }) => (
  <button onClick={onClick} className="card" style={{
    padding: 14, textAlign: 'left', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10, transition: 'transform .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
  >
    <div style={{ fontSize: 24 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--amber)' }}>{count}</div>
    </div>
  </button>
);

// ═══════════════ PROFILE ═══════════════
const Profile = ({ profile, onBack, onUpdateProfile, onLogout, onResetData, tweaks, onChangeTweak, playShortcuts }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [editingName, setEditingName] = React.useState(false);
  const [tmpName, setTmpName] = React.useState(profile.name || '');
  const [notif, setNotif] = React.useState(true);
  const [units, setUnits] = React.useState('ml');
  const [lang, setLang] = React.useState((window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es');
  const [reduce, setReduce] = React.useState(() => {
    try { return localStorage.getItem('stirio::reduce_motion') === '1'; } catch { return false; }
  });
  const [textScale, setTextScale] = React.useState(() => {
    try { return localStorage.getItem('stirio::text_scale') || 'default'; } catch { return 'default'; }
  });

  // Apply text scale + reduced motion to <html> as data-* attributes so
  // tokens.css / style.css media queries can react. Persist to localStorage.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-text-scale', textScale);
    try { localStorage.setItem('stirio::text_scale', textScale); } catch {}
  }, [textScale]);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', reduce ? '1' : '0');
    try { localStorage.setItem('stirio::reduce_motion', reduce ? '1' : '0'); } catch {}
  }, [reduce]);

  // Real achievements (loaded from localStorage + Firestore sync)
  const [achievements, setAchievements] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    const loadAch = async () => {
      if (!window.stAchievements) return;
      try {
        if (window.stAchievements.loadAchievementsFromCloud) {
          await window.stAchievements.loadAchievementsFromCloud();
        }
        if (!cancelled && window.stAchievements.getAchievements) {
          setAchievements(window.stAchievements.getAchievements());
        }
      } catch {}
    };
    // Poll until stAchievements is loaded
    if (window.stAchievements) loadAch();
    else {
      const t = setTimeout(loadAch, 300);
      return () => { cancelled = true; clearTimeout(t); };
    }
    return () => { cancelled = true; };
  }, []);

  // Real leaderboard (Firestore query)
  const [leaderboard, setLeaderboard] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!window.stLeaderboard) return;
      try {
        const fn = window.stLeaderboard.fetchLeaderboard || window.stLeaderboard.getLeaderboard;
        if (!fn) return;
        const list = await fn();
        if (!cancelled && Array.isArray(list)) {
          const me = (window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser()) || null;
          const mapped = list.map(u => ({
            name: u.displayName || u.name || 'Player',
            xp: u.xpTotal || u.xp || 0,
            level: u.level || 1,
            streak: u.streakDays || 0,
            self: me && (u.uid === me.uid),
          }));
          setLeaderboard(mapped);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const saveName = () => {
    const n = tmpName.trim();
    if (n) onUpdateProfile && onUpdateProfile({ name: n });
    setEditingName(false);
  };

  // Real activity totals (computed from the on-device activity log)
  const activityLog = (window.stActivity && window.stActivity.loadActivityLog && window.stActivity.loadActivityLog()) || {};
  let lessons = 0, perfect = 0, durationMs = 0;
  for (const k in activityLog) {
    const d = activityLog[k] || {};
    lessons += d.lessons || 0;
    perfect += d.perfect || 0;
    durationMs += d.durationMs || 0;
  }
  const hours = durationMs / 3600000;
  const hoursLabel = hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);
  const activityTotals = { lessons, perfect, hoursLabel };

  return (
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <button className="btn ghost" onClick={onBack} style={{ padding: 8, marginBottom: 18 }}>
        <Icon name="arrowL" size={18} /> Back
      </button>

      {/* hero */}
      <div className="card" style={{
        padding: 28, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 22,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
        borderColor: 'oklch(0.82 0.17 75 / 0.3)',
      }}>
        <label style={{
          width: 86, height: 86, borderRadius: '50%',
          background: (profile.avatar || profile.photoURL) ? 'transparent' : 'linear-gradient(135deg, var(--amber), var(--berry))',
          display: 'grid', placeItems: 'center',
          fontSize: 36, fontWeight: 600, color: 'var(--bg-0)',
          boxShadow: '0 0 30px var(--amber-glow)',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          flexShrink: 0,
        }} title="Cambiar foto">
          {(profile.avatar || profile.photoURL) ? (
            <img src={profile.avatar || profile.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }} />
          ) : (
            <span>{(profile.name || '?').slice(0, 1).toUpperCase()}</span>
          )}
          {/* camera badge */}
          <span style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--bg-1)', border: '2px solid var(--amber)',
            display: 'grid', placeItems: 'center',
            color: 'var(--amber)',
          }}><Icon name="camera" size={12} /></span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              // Always update local state immediately for snappy UX
              const reader = new FileReader();
              reader.onload = () => {
                onUpdateProfile && onUpdateProfile({ avatar: reader.result });
              };
              reader.readAsDataURL(file);
              // If signed in, also upload to Firebase Storage so it syncs across devices
              const signedIn = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser() && !window.stAuth.getCurrentUser().isGuest;
              if (signedIn && window.stAuth.uploadProfilePhoto) {
                try {
                  const url = await window.stAuth.uploadProfilePhoto(file);
                  onUpdateProfile && onUpdateProfile({ avatar: url });
                } catch (err) {
                  console.warn('photo upload failed:', err);
                }
              }
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
        </label>
        <div style={{ flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>
            {(window.stLang && window.stLang.t) ? window.stLang.t('profile.level_line', { level: profile.level, title: profile.title }) : `level ${profile.level} · ${profile.title}`}
          </div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 32, fontWeight: 400, lineHeight: 1 }}>
            {profile.name || tr('profile.stranger', 'stranger')}
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 2 }}>{tr('profile.joined', 'joined · 🌍 earth')}</div>
        </div>
        <StreakBadge count={profile.streak} />
      </div>

      {/* stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        <StatTile label={tr('profile.stat_xp', 'TOTAL XP')} value={profile.xp} color="var(--amber)" />
        <StatTile label={tr('profile.stat_lessons', 'LESSONS')} value={activityTotals.lessons} color="var(--cyan)" />
        <StatTile label={tr('profile.stat_perfect', 'PERFECT')} value={activityTotals.perfect} color="var(--violet)" />
        <StatTile label={tr('profile.stat_hours', 'HOURS')} value={activityTotals.hoursLabel} color="var(--berry)" />
      </div>

      {/* activity graph */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.activity_eyebrow', 'último mes')} title={tr('profile.activity', 'Actividad')} />
        <div className="card" style={{ padding: 18 }}>
          <ActivityHeatmap log={activityLog} />
        </div>
      </section>

      {/* achievements (real, from localStorage + Firestore) */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader
          eyebrow={`${achievements.filter(a => a.unlocked).length} / ${achievements.length || ACHIEVEMENTS.length}`}
          title={tr('profile.achievements', 'Logros')}
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
        }}>
          {(achievements.length ? achievements : ACHIEVEMENTS).map(a => {
            const earned = a.unlocked ?? a.earned;
            const label = a.title || a.label;
            return (
              <div key={a.id} className="card" style={{
                padding: 14, textAlign: 'center',
                opacity: earned ? 1 : 0.35,
                borderColor: earned ? 'oklch(0.82 0.17 75 / 0.3)' : 'var(--line-soft)',
                background: earned ? 'linear-gradient(180deg, var(--amber-soft), var(--bg-2))' : 'var(--bg-1)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6, filter: earned ? 'drop-shadow(0 0 10px var(--amber-glow))' : 'grayscale(1)' }}>{a.icon}</div>
                <div style={{ fontWeight: 500, fontSize: 12 }}>{label}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>{a.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* leaderboard full (real, from Firestore) */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.ranking_eyebrow', 'ranking')} title={tr('profile.ranking_title', 'Ranking global')} />
        <div className="card" style={{ padding: 4 }}>
          {(leaderboard.length ? leaderboard : []).map((p, i) => (
            <div key={`${p.name}-${i}`} style={{
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderRadius: 'var(--r-md)',
              background: p.self ? 'var(--amber-soft)' : 'transparent',
              border: p.self ? '1px solid oklch(0.82 0.17 75 / 0.4)' : '1px solid transparent',
            }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: i < 3 ? 'var(--amber)' : 'var(--ink-3)' }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: p.self ? 600 : 400 }}>{p.name}</span>
                <span style={{ marginLeft: 8, color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--f-mono)' }}>Lv {p.level}</span>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: p.self ? 'var(--amber)' : 'var(--ink-1)', fontWeight: 600 }}>
                {(p.xp || 0).toLocaleString()}
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div style={{ padding: '18px 14px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              {tr('profile.no_ranking', 'Todavía no hay clasificación. Juega una partida para aparecer aquí.')}
            </div>
          )}
        </div>
      </section>

      {/* SETTINGS */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.eyebrow_ajustes', 'ajustes')} title={tr('profile.account_title', 'Cuenta')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            icon="👤"
            label={tr('profile.name', 'Nombre')}
            value={editingName ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={tmpName}
                  onChange={e => setTmpName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  style={{
                    background: 'var(--bg-2)', border: '1px solid var(--amber)',
                    borderRadius: 8, padding: '6px 10px', fontSize: 14,
                    color: 'var(--ink-0)', width: 140, outline: 'none',
                  }}
                />
                <button onClick={saveName} className="btn primary" style={{ padding: '6px 12px', fontSize: 12 }}>OK</button>
              </div>
            ) : (
              <button onClick={() => { setTmpName(profile.name || ''); setEditingName(true); }}
                style={{ color: 'var(--ink-1)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {profile.name || '—'} <Icon name="edit" size={12} />
              </button>
            )}
          />
          <SettingsRow
            icon="📧"
            label="Cuenta"
            value={<span style={{ color: 'var(--ink-2)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{profile.name ? `${profile.name}@google` : 'invitado'}</span>}
          />

          <SettingsDivider />

          <SettingsRow
            icon="🎨"
            label={tr('profile.theme', 'Tema')}
            value={
              <select
                value={tweaks?.theme || 'lounge'}
                onChange={e => onChangeTweak && onChangeTweak('theme', e.target.value)}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                }}
              >
                <option value="lounge">Lounge · Original</option>
                <option value="daybar">Daybar</option>
                <option value="midnight">Midnight</option>
                <option value="tiki">Tiki</option>
                <option value="punk">Punk</option>
                <option value="mezcal">Mezcal</option>
              </select>
            }
          />
          <SettingsRow
            icon="▶️"
            label={tr('profile.play_shortcut', 'Acceso rápido')}
            value={
              <select
                value={tweaks?.playShortcut || 'daily'}
                onChange={e => onChangeTweak && onChangeTweak('playShortcut', e.target.value)}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                  maxWidth: 180,
                }}
              >
                {(playShortcuts || []).map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
            }
          />
          <SettingsRow
            icon="🌐"
            label={tr('profile.language', 'Idioma')}
            value={
              <select
                value={lang}
                onChange={e => {
                  const v = e.target.value;
                  setLang(v);
                  if (window.stLang && window.stLang.setLang) {
                    try { window.stLang.setLang(v); } catch {}
                  }
                  // Fire an app-wide event so components re-render with the new language.
                  window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: v } }));
                }}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
                <option value="de">Deutsch</option>
              </select>
            }
          />
          <SettingsRow
            icon="🥃"
            label="Unidades"
            value={
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-2)', padding: 3, borderRadius: 8 }}>
                {['ml', 'oz'].map(u => (
                  <button key={u} onClick={() => setUnits(u)} style={{
                    padding: '5px 12px', borderRadius: 6,
                    background: units === u ? 'var(--amber)' : 'transparent',
                    color: units === u ? 'var(--bg-0)' : 'var(--ink-2)',
                    fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600,
                  }}>{u}</button>
                ))}
              </div>
            }
          />

          <SettingsDivider />

          <SettingsRow
            icon="🔔"
            label="Recordatorio diario"
            value={<Toggle on={notif} onChange={setNotif} />}
          />
          <SettingsRow
            icon="🎬"
            label="Reducir animaciones"
            value={<Toggle on={reduce} onChange={setReduce} />}
          />
          <SettingsRow
            icon="🔤"
            label={tr('profile.text_size', 'Tamaño de texto')}
            value={
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-2)', padding: 3, borderRadius: 8 }}>
                {[['sm','A'],['default','A'],['lg','A']].map(([v, a], i) => (
                  <button key={v} onClick={() => setTextScale(v)} style={{
                    padding: '5px 10px', borderRadius: 6,
                    background: textScale === v ? 'var(--amber)' : 'transparent',
                    color: textScale === v ? 'var(--bg-0)' : 'var(--ink-2)',
                    fontSize: i === 0 ? 11 : i === 1 ? 13 : 16, fontWeight: 600,
                  }}>{a}</button>
                ))}
              </div>
            }
          />

          <SettingsDivider />

          <SettingsRow
            icon="💾"
            label={tr('profile.export', 'Exportar datos')}
            value={<button onClick={() => {
              const data = JSON.stringify({ profile, tweaks }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'stirio-datos.json'; a.click();
            }} style={{ color: 'var(--cyan)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>descargar ↓</button>}
          />
          <SettingsRow
            icon="🗑️"
            label={tr('profile.delete_progress', 'Borrar progreso')}
            value={<button onClick={async () => {
              if (!confirm(tr('profile.delete_progress_confirm', '¿Borrar todo tu progreso? Esto restablece XP, nivel y estadísticas.'))) return;
              // Try to also delete cloud data if signed in
              const signedIn = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser() && !window.stAuth.getCurrentUser().isGuest;
              if (signedIn && window.stAuth.deleteUserData) {
                try { await window.stAuth.deleteUserData(); } catch (e) { console.warn('cloud wipe failed:', e); }
              }
              onResetData && onResetData();
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>borrar →</button>}
          />
          <SettingsRow
            icon="🚪"
            label={tr('profile.sign_out', 'Cerrar sesión')}
            value={<button onClick={() => {
              if (confirm(tr('profile.sign_out_confirm', '¿Cerrar sesión? Volverás al onboarding.'))) {
                onLogout && onLogout();
              }
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>logout →</button>}
          />
          <SettingsRow
            icon="⚠️"
            label={tr('profile.delete_account', 'Borrar cuenta')}
            isLast
            value={<button onClick={async () => {
              const me = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser();
              if (!me || me.isGuest) {
                alert(tr('profile.delete_account_only_google', 'Solo disponible para cuentas Google.'));
                return;
              }
              if (!confirm(tr('profile.delete_account_confirm', '¿Borrar tu cuenta de Stirio y todos tus datos? Esta acción es irreversible.'))) return;
              try {
                await window.stAuth.deleteUserAccount();
                onLogout && onLogout();
              } catch (e) {
                alert(tr('profile.delete_account_error', 'No se pudo borrar la cuenta. Reinicia sesión y vuelve a intentarlo.'));
                console.warn('delete account failed:', e);
              }
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>eliminar →</button>}
          />
        </div>

        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-4)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Stirio v0.9.2 · Hecho con ❤️ en Málaga
        </div>
      </section>
    </div>
  );
};

const SettingsRow = ({ icon, label, value, isLast }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px',
    borderBottom: isLast ? 'none' : '1px solid var(--line-soft)',
    minHeight: 56,
  }}>
    <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</div>
    <div style={{ flex: 1, fontSize: 14, color: 'var(--ink-1)' }}>{label}</div>
    <div>{value}</div>
  </div>
);

const SettingsDivider = () => (
  <div style={{ height: 8, background: 'var(--bg-0)' }} />
);

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width: 44, height: 26, borderRadius: 999,
    background: on ? 'var(--amber)' : 'var(--bg-3)',
    border: '1px solid ' + (on ? 'transparent' : 'var(--line)'),
    position: 'relative', transition: 'background .2s',
    boxShadow: on ? '0 0 12px var(--amber-glow)' : 'none',
  }}>
    <div style={{
      position: 'absolute', top: 2, left: on ? 20 : 2,
      width: 20, height: 20, borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      transition: 'left .2s cubic-bezier(.2,1.4,.3,1)',
    }} />
  </button>
);

const StatTile = ({ label, value, color }) => (
  <div className="card" style={{ padding: 14 }}>
    <div style={{
      fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 600, color,
      letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
  </div>
);

const ActivityHeatmap = ({ log }) => {
  // 7 cols × 5 rows = last 35 days (≈ último mes). Today is top-left,
  // going back in time toward bottom-right (oldest).
  const days = 35;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const cells = [];
  let maxXp = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const entry = (log && log[dayKey(d)]) || null;
    const xp = entry ? (entry.xp || 0) : 0;
    const lessons = entry ? (entry.lessons || 0) : 0;
    if (xp > maxXp) maxXp = xp;
    cells.push({ xp, lessons });
  }
  const scale = maxXp > 0 ? maxXp : 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, maxWidth: 380 }}>
      {cells.map((c, i) => {
        // Intensity from XP when available; fallback to a minimum tint when
        // there was any activity (lessons > 0) so "played today" never looks
        // like an empty cell.
        const xpIntensity = c.xp > 0 ? Math.min(1, c.xp / scale) : 0;
        const v = xpIntensity > 0 ? xpIntensity : (c.lessons > 0 ? 0.35 : 0);
        return (
          <div key={i} style={{
            aspectRatio: 1,
            borderRadius: 4,
            background: v === 0 ? 'var(--bg-3)' : `oklch(0.82 0.17 75 / ${0.2 + v * 0.8})`,
            boxShadow: v > 0.6 ? '0 0 6px var(--amber-glow)' : 'none',
          }} />
        );
      })}
    </div>
  );
};

const ModeSheet = ({ mode, onClose, onStart }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const modes = {
    daily: { icon: '📅', title: tr('mode.daily.title', 'Reto Diario'), subtitle: tr('mode.daily.sub', '10 preguntas nuevas cada día'), body: tr('mode.daily.body', 'Una ronda curada por nuestro barman-jefe. Se renueva a medianoche.'), cta: tr('mode.daily.cta', 'Empezar reto') },
    duel: { icon: '⚔️', title: tr('mode.duel.title', 'Duelo'), subtitle: tr('mode.duel.sub', 'Reta a amigos, rivales o a un bot'), body: tr('mode.duel.body', 'Crea una sala con código, únete a una existente o busca rival aleatorio.'), cta: tr('mode.duel.cta', 'Crear sala') },
    academy: { icon: '🎓', title: tr('mode.academy.title', 'Cocktail Academy'), subtitle: tr('mode.academy.sub', 'Familias de cócteles, paso a paso'), body: tr('mode.academy.body', 'Sours, Highballs, Martinis, Old-School, Tiki y Modernos — con teoría, práctica y quiz.'), cta: tr('mode.academy.cta', 'Abrir academia') },
    speed: { icon: '⚡', title: tr('mode.speed.title', 'Modo Velocidad'), subtitle: tr('mode.speed.sub', '60 segundos · cuantas más aciertes, más XP'), body: tr('mode.speed.body', 'Preguntas encadenadas hasta que el reloj llegue a cero.'), cta: tr('mode.speed.cta', 'Empezar') },
    builder: { icon: '🍹', title: tr('mode.builder.title', 'Constructor'), subtitle: tr('mode.builder.sub', 'Adivina el cóctel por sus ingredientes'), body: tr('mode.builder.body', 'Te damos la receta sin nombre. Tú nos dices qué es.'), cta: tr('mode.builder.cta', 'Jugar') },
    blind: { icon: '👃', title: tr('mode.blind.title', 'Cata a ciegas'), subtitle: tr('mode.blind.sub', '35+ destilados'), body: tr('mode.blind.body', 'Pistas de aroma y sabor. Identifica el destilado sin ver la etiqueta.'), cta: tr('mode.blind.cta', 'Jugar') },
    freequiz: { icon: '🎲', title: tr('mode.freequiz.title', 'Quiz Libre'), subtitle: tr('mode.freequiz.sub', '24 rondas temáticas'), body: tr('mode.freequiz.body', 'Elige la categoría, el largo y la dificultad. Sin presión.'), cta: tr('mode.freequiz.cta', 'Jugar') },
    arcade: { icon: '🕹️', title: tr('mode.arcade.title', 'Arcade Coctelero'), subtitle: tr('mode.arcade.sub', 'Aprende recetas jugando'), body: tr('mode.arcade.body', 'Mini-juegos con físicas: shake-o-meter, garnish catcher, pour target.'), cta: tr('mode.arcade.cta', 'Jugar') },
    memory: { icon: '🧠', title: tr('mode.memory.title', 'Memoria de Garnish'), subtitle: tr('mode.memory.sub', 'Empareja guarniciones'), body: tr('mode.memory.body', 'Memory clásico con ingredientes, vasos y herramientas.'), cta: tr('mode.memory.cta', 'Jugar') },
    rhythm: { icon: '🥁', title: tr('mode.rhythm.title', 'Ritmo de Shaker'), subtitle: tr('mode.rhythm.sub', 'Agita al compás'), body: tr('mode.rhythm.body', 'Sigue el ritmo. Cuanto mejor tu tempo, más perfecta la emulsión.'), cta: tr('mode.rhythm.cta', 'Jugar') },
    iba: { icon: '📖', title: tr('mode.iba.title', 'Fichas IBA'), subtitle: tr('mode.iba.sub', '90 recetas oficiales'), body: tr('mode.iba.body', 'Las recetas reconocidas por la International Bartenders Association, con historia y técnica.'), cta: tr('mode.iba.cta', 'Abrir') },
    wiki: { icon: '🌐', title: tr('mode.wiki.title', 'Enciclopedia'), subtitle: tr('mode.wiki.sub', 'Todo el conocimiento'), body: tr('mode.wiki.body', 'Bebidas, técnicas, cristalería, herramientas y personajes.'), cta: tr('mode.wiki.cta', 'Abrir') },
    glossary: { icon: '📝', title: tr('mode.glossary.title', 'Glosario'), subtitle: tr('mode.glossary.sub', '70+ términos'), body: tr('mode.glossary.body', 'Del muddle al dry shake. Todos los términos del oficio.'), cta: tr('mode.glossary.cta', 'Abrir') },
    map: { icon: '🗺️', title: tr('mode.map.title', 'Mapa de Destilados'), subtitle: tr('mode.map.sub', '12 regiones'), body: tr('mode.map.body', 'Whisky escocés, mezcal oaxaqueño, pisco peruano… mapa interactivo.'), cta: tr('mode.map.cta', 'Explorar') },
    library: { icon: '📚', title: tr('mode.library.title', 'Biblioteca 3D'), subtitle: tr('mode.library.sub', 'Modelos interactivos'), body: tr('mode.library.body', 'Vasos, herramientas y botellas en 3D. Gíralos, inspecciónalos.'), cta: tr('mode.library.cta', 'Abrir') },
  };
  const m = modes[mode];
  if (!m) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 20,
      animation: 'fadeIn .25s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        maxWidth: 460, width: '100%',
        padding: 28,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
        borderColor: 'oklch(0.82 0.17 75 / 0.3)',
        animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, padding: 6, color: 'var(--ink-3)' }}>
          <Icon name="close" size={18} />
        </button>
        <div style={{ fontSize: 64, marginBottom: 10, filter: 'drop-shadow(0 6px 20px var(--amber-glow))' }}>{m.icon}</div>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 4 }}>{m.subtitle}</div>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: '0 0 10px', lineHeight: 1.05 }}>{m.title}</h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 20 }}>{m.body}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={onClose}>{tr('mode.close', 'Cerrar')}</button>
          <button className="btn primary" onClick={onStart} style={{ flex: 1 }}>
            <Icon name="play" size={14} /> {m.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Onboarding, Home, Profile, ModeSheet });
