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
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono caps" style={{ color: 'var(--ink-2)', fontSize: 10, marginBottom: 2 }}>
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

      {/* hero 2×2: Article + Featured up top (equal hero tiles), Daily +
          Duel below (equal secondary tiles). Each tile sized by its
          importance class instead of by content length. When there's no
          article we fall back to a single hero row so the grid doesn't
          render an empty cell. tokens.css collapses this to one column on
          narrow viewports. */}
      <section style={{ marginBottom: 32 }}>
        <div
          className="mobile-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 14,
          }}
        >
          {articleOfDay
            ? <ArticleOfDayCard article={articleOfDay} onOpen={() => onOpenMode('article')} />
            : null}
          <FeaturedCard lesson={featured} onPlay={() => onPickLesson(featured)} />
          <DailyCard onPlay={() => onOpenMode('daily')} />
          <DuelCard onPlay={() => onOpenMode('duel')} />
        </div>
      </section>

      {/* Academy — three parallel tracks (Cocktails / Wine / Coffee).
          Each track gets its own mini card with real progress so the Home
          preview matches the AcademyHub instead of pretending Cocktails is
          the only path. Tapping a card jumps straight into that track. */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          eyebrow={tr('home.academy_eyebrow', 'aprende')}
          title={tr('home.academy_title', 'Aprende paso a paso')}
          action={(
            <button
              className="btn ghost"
              onClick={() => onOpenMode('academy')}
              style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontSize: 11 }}
            >
              {tr('home.academy_cta', 'Abrir')} <Icon name="arrowR" size={12} />
            </button>
          )}
        />
        <div className="home-academy-tracks" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <AcademyTrackCard track="cocktail" icon="🍸" color="var(--amber)"
            titleKey="academy.cocktail.title" titleFallback="Cocktail Academy"
            descKey="academy.cocktail.desc"   descFallback="Familias, técnicas y clásicos"
            onOpen={() => onOpenMode('academy')} />
          <AcademyTrackCard track="wine" icon="🍷" color="oklch(0.45 0.16 10)"
            titleKey="academy.wine.title" titleFallback="Sommelier Academy"
            descKey="academy.wine.desc"   descFallback="Uvas, regiones y cata"
            onOpen={() => onOpenMode('academy')} />
          <AcademyTrackCard track="coffee" icon="☕" color="oklch(0.42 0.08 50)"
            titleKey="academy.coffee.title" titleFallback="Barista Academy"
            descKey="academy.coffee.desc"   descFallback="Granos, espresso y leche"
            onOpen={() => onOpenMode('academy')} />
        </div>
      </section>

      {/* Phase 5b: modes grouped by intention from the js/modes.js registry.
          Replaces the former "Modos rápidos" / "Mini juegos" / "Referencia
          rápida" sections, reorganized so the user can scan by what they
          want to do rather than by tile shape. */}
      {(window.stModes?.MODE_GROUPS || []).map(group => {
        const modes = window.stModes?.getModesByGroup?.(group) || [];
        if (!modes.length) return null;
        return (
          <section key={group} style={{ marginBottom: 32 }}>
            <SectionHeader
              eyebrow={tr(`home.section.${group}.eyebrow`, group)}
              title={tr(`mode.group.${group}`, group)}
            />
            <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {modes.map(m => {
                // m.color is "var(--amber)" — strip wrapper for the legacy
                // ModeCard accent prop which composes "var(--<accent>)".
                const accent = (m.color || '').replace(/^var\(--/, '').replace(/\)$/, '') || 'amber';
                return (
                  <ModeCard
                    key={m.id}
                    icon={m.icon}
                    title={tr(`mode.${m.id}.title`, m.id)}
                    caption={tr(`mode.${m.id}.sub`, '')}
                    accent={accent}
                    onClick={() => onOpenMode(m.id)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

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
                color: i < 3 ? 'var(--amber)' : 'var(--ink-2)',
              }}>{i + 1}</div>
              <div style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: p.self ? 600 : 400 }}>{p.name}</span>
                <span style={{ marginLeft: 8, color: 'var(--ink-2)', fontSize: 12, fontFamily: 'var(--f-mono)' }}>Lv {p.level}</span>
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

// Hero art panel shared by FeaturedCard and ArticleOfDayCard. We render a
// gradient + emoji centerpiece instead of stock photos because the curated
// Unsplash IDs we used to map per-cocktail were unreliable (showing wrong
// drinks). Emoji-on-gradient is honest about what the card represents and
// matches across both hero variants.
const HeroArt = ({ emoji, accentVar }) => (
  <div className="mobile-featured-art" style={{
    position: 'relative', overflow: 'hidden',
    background: `radial-gradient(120% 90% at 70% 30%, ${accentVar}, oklch(0.18 0.04 50) 75%)`,
    display: 'grid', placeItems: 'center',
  }}>
    <div style={{
      fontSize: 'clamp(64px, 9vw, 110px)', lineHeight: 1,
      filter: `drop-shadow(0 10px 30px ${accentVar})`,
      opacity: 0.95,
    }}>{emoji}</div>
    {/* Subtle grain */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'repeating-radial-gradient(circle at 20% 30%, transparent 0 2px, rgba(0,0,0,0.05) 2px 3px)',
      mixBlendMode: 'overlay',
      opacity: 0.6,
      pointerEvents: 'none',
    }} />
    <div className="mobile-featured-fade" style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
    }} />
  </div>
);

const FeaturedCard = ({ lesson, onPlay }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const trP = (k, params, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k, params) : (f || k);
  const accent = lesson.accent || 'amber';
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
          <div className="mono caps" style={{ color: `var(--${accent})`, fontSize: 11, marginBottom: 8 }}>
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
      <HeroArt emoji={lesson.emoji || '🍸'} accentVar={`var(--${accent}-glow, var(--amber-glow))`} />
    </div>
  );
};

const ArticleOfDayCard = ({ article, onOpen }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const typeLabels = { technique: 'Técnica', spirit: 'Destilado', history: 'Historia', trend: 'Tendencia', cocktail: 'Cóctel' };
  const color = article.color || 'oklch(0.55 0.22 290)';
  return (
    <button onClick={onOpen} className="card mobile-featured" style={{
      padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      minHeight: 260,
      border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
      background: 'var(--bg-1)',
      position: 'relative', transition: 'transform .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div className="mobile-featured-copy" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 8, letterSpacing: '0.12em' }}>
            {tr('home.article_eyebrow', 'Artículo del día')} · {tr('article.type.' + article.type, typeLabels[article.type] || 'Artículo')}
          </div>
          <h3 style={{
            fontFamily: 'var(--f-serif)', fontWeight: 400,
            fontSize: 'clamp(22px, 2.6vw, 30px)',
            margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-0.01em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{article.title}</h3>
          {article.excerpt && (
            <div style={{
              color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{article.excerpt}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <span className="btn primary" style={{ padding: '12px 22px' }}>
            {tr('home.article_cta', 'Leer')} <Icon name="arrowR" size={14} />
          </span>
        </div>
      </div>
      <HeroArt emoji={article.emoji || '📰'} accentVar={color} />
    </button>
  );
};

const AcademyTrackCard = ({ track, icon, color, titleKey, titleFallback, descKey, descFallback, onOpen }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // Same progress heuristic as the AcademyHub: a level counts as "done"
  // when at least one of its lessons passed. We read the per-track key
  // and fall back to the legacy `cq_academy_progress` key for cocktail.
  const KEYS = { cocktail: 'cq_academy_cocktail', wine: 'cq_academy_wine', coffee: 'cq_academy_coffee' };
  let done = 0, total = 0;
  try {
    const raw = localStorage.getItem(KEYS[track])
      || (track === 'cocktail' ? localStorage.getItem('cq_academy_progress') : null);
    const prog = JSON.parse(raw || '{}');
    done = Object.values(prog).filter(l => (l.lessons || []).some(x => x?.passed)).length;
    const levels = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
    total = levels.length;
  } catch {}
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <button onClick={onOpen} className="card" style={{
      padding: 16, textAlign: 'left', cursor: 'pointer',
      display: 'grid', gap: 10,
      borderLeft: `4px solid ${color}`,
      transition: 'transform .15s, border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}, oklch(0.22 0.04 60))`,
          display: 'grid', placeItems: 'center', fontSize: 22,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 18, lineHeight: 1.1 }}>{tr(titleKey, titleFallback)}</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--f-mono)', marginTop: 2 }}>
            {total ? `${done} / ${total}` : '–'}
          </div>
        </div>
        <Icon name="arrowR" size={14} />
      </div>
      <div style={{ color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.35 }}>{tr(descKey, descFallback)}</div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .3s' }} />
      </div>
    </button>
  );
};

const DailyCard = ({ onPlay }) => {
  const tr = (k, f, p) => {
    if (window.stLang && window.stLang.t) return window.stLang.t(k, p || {}, f);
    if (window.stUiT) return window.stUiT(k, f);
    return f || k;
  };
  // Reflect today's daily format (rotates by seed parity in DAILY_LESSON):
  // even days → 10-question quiz, odd days → 60s focus on one cocktail.
  const fmt = (window.getDailyFormat && window.getDailyFormat()) || { format: 'quiz' };
  const isSpeed = fmt.format === 'speed-focus';
  const title = isSpeed
    ? tr('home.daily_title_speed', `Coctel del día: ${fmt.cocktailName}`, { name: fmt.cocktailName })
    : tr('home.daily_title', '10 preguntas frescas');
  const subtitle = isSpeed
    ? tr('home.daily_sub_speed', '60 segundos · +200 XP')
    : tr('home.daily_sub', 'Nuevas cada día · +120 XP');
  return (
  <button onClick={onPlay} className="card" style={{
    padding: 18, textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 8,
    background: isSpeed
      ? 'linear-gradient(135deg, oklch(0.78 0.18 80 / 0.18), var(--bg-2))'
      : 'linear-gradient(135deg, oklch(0.78 0.13 200 / 0.18), var(--bg-2))',
    borderColor: isSpeed ? 'oklch(0.78 0.18 80 / 0.3)' : 'oklch(0.78 0.13 200 / 0.3)',
    minHeight: 112, transition: 'transform .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div className="mono caps" style={{ color: isSpeed ? 'var(--amber)' : 'var(--cyan)', fontSize: 10 }}>{tr('home.daily_eyebrow', 'reto diario')}</div>
      <div style={{ fontSize: 22 }}>{isSpeed ? '⚡' : '📅'}</div>
    </div>
    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.05 }}>{title}</div>
    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{subtitle}</div>
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

Object.assign(window, { Home });
