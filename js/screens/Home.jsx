// Stirio — Home screen (queue, featured card, mode shortcuts, reference tiles)
// Depends on ui.jsx, data.js, ficha-images.js, wiki-map.js (for MAP_REGIONS).
// Split from the former monolithic js/screens.jsx (PR #145).

// ═══════════════ HOME ═══════════════
const Home = ({ profile, onPickLesson, onOpenProfile, onOpenMode }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // 60s queue shuffle — each click of the Aleatorio button bumps queueSeed,
  // triggering a fresh Fisher-Yates pass. Seed 0 keeps the canonical order.
  const [queueSeed, setQueueSeed] = React.useState(0);
  const queueOrder = React.useMemo(() => {
    if (queueSeed === 0) return LESSONS;
    const out = [...LESSONS];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }, [queueSeed]);
  // window.MAP_REGIONS is populated by map.jsx's async import of wiki-map.js.
  // Re-render when that finishes so the Map tile badge/preview reflect reality
  // instead of showing "0 regiones" on first paint.
  const [, setMapRegionsTick] = React.useState(0);
  React.useEffect(() => {
    if (window.MAP_REGIONS && window.MAP_REGIONS.length) return;
    const onReady = () => setMapRegionsTick(t => t + 1);
    window.addEventListener('stirio:mapregionsready', onReady);
    return () => window.removeEventListener('stirio:mapregionsready', onReady);
  }, []);
  // Real leaderboard preview. Retries once after mount because Firebase
  // auth + stLeaderboard may not be ready on the first render, which would
  // otherwise leave the home preview empty until the user navigates away.
  const [leaderboardPreview, setLeaderboardPreview] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled || !window.stLeaderboard) return;
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
    };
    load();
    const retryTimer = setTimeout(load, 1500);
    const onRefresh = () => load();
    window.addEventListener('stirio:xpchange', onRefresh);
    window.addEventListener('stirio:authchange', onRefresh);
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      window.removeEventListener('stirio:xpchange', onRefresh);
      window.removeEventListener('stirio:authchange', onRefresh);
    };
  }, []);
  // Featured cocktail rotates daily: different lesson each calendar day,
  // cycling through LESSONS. Uses UTC day-of-epoch so everyone sees the
  // same featured on a given day.
  const _dayIdx = Math.floor(Date.now() / 86400000);
  const featured = LESSONS[_dayIdx % LESSONS.length] || LESSONS[0];
  // Article of the day — re-resolved on every render so language changes pick
  // up immediately. Returns null if stArticles hasn't loaded yet.
  const articleOfDay = (window.stArticles && window.stArticles.getArticleOfTheDay()) || null;
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
          <button
            className="btn ghost"
            onClick={async () => {
              const result = window.shareApp ? await window.shareApp() : null;
              if (result === 'copied') {
                window.stToast?.show({ kind: 'info', title: tr('home.share_copied', 'Enlace copiado'), ttl: 2000 });
              }
            }}
            style={{ padding: 8, width: 38, height: 38, borderRadius: '50%' }}
            aria-label={tr('home.share_app', 'Compartir Stirio')}
            title={tr('home.share_app', 'Compartir Stirio')}
          >
            <Icon name="share" size={16} />
          </button>
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
          <span>{(() => {
            if (!(window.stLang && window.stLang.t)) return `Nivel ${profile.level} · ${profile.title}`;
            const titleKey = `profile.level.${profile.level}.title`;
            const titleVal = window.stLang.t(titleKey);
            const title = (titleVal && titleVal !== titleKey) ? titleVal : (profile.title || '');
            return window.stLang.t('profile.level_line', { level: profile.level, title });
          })()}</span>
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

      {/* article of the day */}
      {articleOfDay && (
        <section style={{ marginBottom: 24 }}>
          <ArticleOfDayCard article={articleOfDay} onOpen={() => onOpenMode('article')} />
        </section>
      )}

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
        {(() => {
          // Derive the real level-complete counter from localStorage so the
          // Home academy header matches the Academy screen. A level is
          // considered complete when at least one of its lessons passed —
          // same heuristic as the Reference tile a few sections below.
          let academyHomeDone = 0;
          let academyHomeTotal = 6;
          try {
            const prog = JSON.parse(localStorage.getItem('cq_academy_cocktail') || localStorage.getItem('cq_academy_progress') || '{}');
            academyHomeDone = Object.values(prog).filter(l => (l.lessons || []).some(x => x?.passed)).length;
            const levels = (window.getAcademyLevels && window.getAcademyLevels('cocktail')) || [];
            if (levels.length) academyHomeTotal = levels.length;
          } catch {}
          return (
            <SectionHeader
              eyebrow={tr('home.academy_eyebrow', 'aprende')}
              title={tr('academy.title_ui', 'Cocktail Academy')}
              action={<span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{academyHomeDone} / {academyHomeTotal}</span>}
            />
          );
        })()}
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
          <ArcadeCard title={tr('home.comanda_title', 'Comanda Chase')} subtitle={tr('home.comanda_sub', 'Sirve cócteles contrarreloj')} icon="🎟️" onClick={() => onOpenMode('comanda')} />
        </div>
      </section>

      {/* Reference — 2×2 with dynamic previews */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader eyebrow={tr('home.ref_eyebrow', 'referencia')} title={tr('home.ref_title', 'Referencia rápida')} />
        {(() => {
          const dayIdx = Math.floor(Date.now() / 86400000);
          const fichas = (window.ALL_FICHAS || []);
          const fichaPreview = fichas.length ? fichas[dayIdx % fichas.length].name : 'Negroni, Daiquiri…';
          const wikiCats = ['Historia', 'Técnicas', 'Destilados', 'Prohibición', 'Tiki', 'Jerry Thomas', 'Modelos 3D', 'Bares legendarios'];
          const wikiPreview = wikiCats[dayIdx % wikiCats.length];
          const regions = (window.MAP_REGIONS || []);
          const mapPreview = regions.length ? regions[dayIdx % regions.length].origin : 'Escocia, México…';
          let academyDone = 0;
          try {
            const prog = JSON.parse(localStorage.getItem('cq_academy_cocktail') || localStorage.getItem('cq_academy_progress') || '{}');
            academyDone = Object.values(prog).filter(l => (l.lessons || []).some(x => x?.passed)).length;
          } catch {}
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <RefTileLarge icon="📖" label={tr('home.ref_iba', 'Recetas')}
                preview={fichaPreview}
                badge={`${fichas.length || 0} ${tr('home.ref_cocktails', 'cócteles')}`}
                accent="amber"
                onClick={() => onOpenMode('iba')} />
              <RefTileLarge icon="🌐" label={tr('home.ref_wiki', 'Enciclopedia')}
                preview={wikiPreview}
                badge="∞"
                accent="cyan"
                onClick={() => onOpenMode('wiki')} />
              <RefTileLarge icon="🗺️" label={tr('home.ref_map', 'Mapa de bebidas')}
                preview={mapPreview}
                badge={`${regions.length || 0} ${tr('home.ref_drinks', 'bebidas')}`}
                accent="violet"
                onClick={() => onOpenMode('map')} />
              <RefTileLarge icon="🎓" label={tr('home.ref_academy', 'Academia')}
                preview={`${academyDone}/6 ${tr('home.ref_academy_levels', 'niveles')}`}
                badge={tr('home.ref_academy_badge', 'curso')}
                accent="berry"
                onClick={() => onOpenMode('academy')} />
            </div>
          );
        })()}
      </section>

      {/* Up next (60s) */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          eyebrow={tr('home.queue_eyebrow', '60s queue')}
          title={tr('home.queue_title', 'Rondas de 60 segundos')}
          action={
            <button
              className="btn ghost"
              onClick={() => setQueueSeed(s => s + 1)}
              style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontSize: 11 }}
            >
              <Icon name="shuffle" size={14} /> {tr('home.queue_shuffle', 'Aleatorio')}
            </button>
          }
        />
        <div className="lesson-carousel" style={{
          display: 'flex', gap: 12,
          overflowX: 'auto',
          // Stop the carousel's swipe from chaining to the body when it
          // reaches either end — otherwise iOS can rubber-band the whole
          // page a few pixels despite the root's overflow-x: clip.
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          // Breathing room at both edges so the first/last card doesn't kiss
          // the viewport edge; matches the 20px Home container padding.
          margin: '0 -20px', padding: '4px 20px 12px',
          scrollbarWidth: 'none',
        }}>
          {queueOrder.map(l => (
            <div key={l.id} style={{
              flex: '0 0 78%',
              maxWidth: 320,
              scrollSnapAlign: 'start',
            }}>
              <LessonCard lesson={l} onPlay={() => onPickLesson(l)} />
            </div>
          ))}
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
            <div style={{ padding: '20px 16px', display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--amber-soft)',
                display: 'grid', placeItems: 'center', color: 'var(--amber)',
              }}>
                <Icon name="trophy" size={22} />
              </div>
              <div style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.4, maxWidth: 280 }}>
                {tr('home.no_ranking', 'Juega una ronda para aparecer en el ranking')}
              </div>
              <button className="btn primary" onClick={() => onOpenMode('daily')} style={{ padding: '8px 16px', fontSize: 13 }}>
                {tr('home.leaderboard_cta', 'Empezar ahora')} <Icon name="arrowR" size={14} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// SectionHeader vive en js/screens/shared.jsx porque Profile.jsx también
// lo consume — evitamos un acoplamiento implícito por orden de scripts.

// Fotos cinemáticas de Unsplash (source URL estable, recortes verticales)
const LESSON_IMAGES = {
  negroni:      'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=900&q=85&auto=format&fit=crop',
  espresso:     'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=900&q=85&auto=format&fit=crop',
  daiquiri:     'https://images.unsplash.com/photo-1514362453360-8cb44e31dabf?w=900&q=85&auto=format&fit=crop',
  oldfashioned: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&q=85&auto=format&fit=crop',
  mojito:       'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=900&q=85&auto=format&fit=crop',
  margarita:    'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=900&q=85&auto=format&fit=crop',
  manhattan:    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&q=85&auto=format&fit=crop',
  whiskeysour:  'https://images.unsplash.com/photo-1599098915050-28f5f5ffdf73?w=900&q=85&auto=format&fit=crop',
  cosmo:        'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=900&q=85&auto=format&fit=crop',
  martini:      'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=900&q=85&auto=format&fit=crop',
  daily:        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=85&auto=format&fit=crop',
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

const ArticleOfDayCard = ({ article, onOpen }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const typeLabels = { technique: 'Técnica', spirit: 'Destilado', history: 'Historia', trend: 'Tendencia', cocktail: 'Cóctel' };
  return (
    <button onClick={onOpen} className="card" style={{
      padding: 18, textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 16,
      background: `linear-gradient(135deg, color-mix(in oklch, ${article.color || 'var(--violet)'} 22%, var(--bg-2)), var(--bg-2))`,
      borderColor: `color-mix(in oklch, ${article.color || 'var(--violet)'} 35%, transparent)`,
      transition: 'transform .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div style={{ flexShrink: 0, position: 'relative', width: 64, height: 64 }}>
        {article.image && (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'grid';
            }}
            style={{
              width: 64, height: 64, borderRadius: 14, objectFit: 'cover',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          />
        )}
        <div style={{
          width: 64, height: 64, borderRadius: 14,
          background: `linear-gradient(135deg, ${article.color || 'var(--violet)'}, oklch(0.22 0.03 60))`,
          display: article.image ? 'none' : 'grid', placeItems: 'center', fontSize: 32,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>{article.emoji || '📰'}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mono caps" style={{
          color: 'var(--amber)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 4,
        }}>
          {tr('home.article_eyebrow', 'Artículo del día')} · {tr('article.type.' + article.type, typeLabels[article.type] || 'Artículo')}
        </div>
        <div style={{
          fontFamily: 'var(--f-serif)', fontSize: 20, lineHeight: 1.15,
          marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{article.title}</div>
        {article.excerpt && (
          <div style={{
            color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{article.excerpt}</div>
        )}
      </div>
      <div style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
        background: 'var(--amber)', display: 'grid', placeItems: 'center',
        color: 'var(--bg-0)',
      }}>
        <Icon name="arrowR" size={14} />
      </div>
    </button>
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

const RefTileLarge = ({ icon, label, preview, badge, onClick, accent = 'amber' }) => (
  <button onClick={onClick} className="card" style={{
    padding: 16, textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10,
    minHeight: 130,
    // --<accent>-soft + --<accent>-glow are defined per-theme in tokens.css and
    // work on every browser. Previously used oklch(from …) relative syntax
    // which silently failed on older Chromium/Safari → blank card fallback.
    background: `linear-gradient(160deg, var(--${accent}-soft, var(--amber-soft)), var(--bg-2) 70%)`,
    borderColor: `var(--${accent}-glow, var(--amber-glow))`,
    transition: 'transform .15s, border-color .2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `var(--${accent})`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 30, filter: `drop-shadow(0 4px 10px var(--${accent}-glow, var(--amber-glow)))` }}>{icon}</div>
      {badge && <div className="mono caps" style={{ fontSize: 9, color: `var(--${accent})`, padding: '2px 8px', border: `1px solid var(--${accent})`, borderRadius: 99, opacity: 0.85 }}>{badge}</div>}
    </div>
    <div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 17, lineHeight: 1.1, marginBottom: 4 }}>{label}</div>
      {preview && <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>}
    </div>
  </button>
);

Object.assign(window, { Home });
