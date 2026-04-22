// ─── Stirio — KnowledgeScreen (Enciclopedia · Historia y Conocimiento) ───
// Unified React-native replacement for the old iframe-based WikiScreen.
// Reads the catalog from window.WIKI_CATEGORIES (bridged by wiki-data.js).
// For categories with `has3d: true`, opens wiki.html?cat=<id> in an embedded
// iframe so the existing R3F experience is preserved untouched.
//
// Dependencies (globals from earlier scripts):
//   - Icon, SectionHeader from ui.jsx / screens.jsx
//   - window.stArticles.POOL / resolveArticle from articles.js
//   - window.ALL_FICHAS from data.js / repo-data.js
//   - tr() from stUiT / stLang
//
// Props:
//   onBack()                 — close the screen (called from Hub view)
//   onOpenArticle(poolEntry) — delegate ArticleScreen mount to parent
//   onOpenFicha(ficha)       — delegate FichaDetail mount to parent

const KnowledgeScreen = ({ onBack, onOpenArticle, onOpenFicha }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));

  const [categories, setCategories] = React.useState(window.WIKI_CATEGORIES || null);
  const [view, setView]             = React.useState('hub'); // 'hub' | 'category' | '3d'
  const [selectedCat, setSelectedCat] = React.useState(null);

  // If the ESM bridge hasn't landed yet, dynamic-import the catalog the way
  // the rest of Stirio imports ES modules (stAuth, stLearn, etc.).
  React.useEffect(() => {
    if (categories) return;
    let alive = true;
    import('./wiki-data.js')
      .then((mod) => { if (alive) setCategories(mod.WIKI_CATEGORIES || []); })
      .catch((err) => { console.warn('[knowledge] import failed', err); if (alive) setCategories([]); });
    return () => { alive = false; };
  }, [categories]);

  // postMessage listener: wiki.html emits {type:'wiki-close'} when the user
  // taps back at its root view. Only active while we're showing the iframe.
  React.useEffect(() => {
    if (view !== '3d') return;
    const onMsg = (e) => {
      if (e && e.data && e.data.type === 'wiki-close') setView('category');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [view]);

  const openCategory = (cat) => { setSelectedCat(cat); setView('category'); };
  const backToHub    = () => { setSelectedCat(null); setView('hub'); };

  // Render switchboard — concrete views live in D2-D6.
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg-0)',
      overflowY: 'auto',
      animation: 'fadeIn .3s ease',
      paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0))',
    }}>
      {view === 'hub'      && <HubView tr={tr} categories={categories || []} onBack={onBack} onOpen={openCategory} />}
      {view === 'category' && <CategoryView tr={tr} cat={selectedCat} onBack={backToHub}
                                            onOpenArticle={onOpenArticle} onOpenFicha={onOpenFicha}
                                            onOpen3D={() => setView('3d')} />}
      {view === '3d'       && <ThreeDView tr={tr} cat={selectedCat} onBack={() => setView('category')} />}
    </div>
  );
};

// Placeholders — filled in steps D2 (Hub), D3 (Category generic + 3D button),
// D4 (ThreeDView), D5 (history curated sections), D6 (cocktails with story).
const HubView = ({ tr, categories, onBack, onOpen }) => (
  <div>
    {/* Hero */}
    <div style={{
      position: 'relative',
      padding: '24px 24px 28px',
      background: 'linear-gradient(160deg, #8e44ad 0%, oklch(0.2 0.05 320) 100%)',
      minHeight: 220,
    }}>
      <button onClick={onBack}
        aria-label={tr('knowledge.back', 'Volver')}
        className="btn"
        style={{
          padding: 8, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)',
        }}>
        <Icon name="arrowL" size={16} />
      </button>
      <div style={{ marginTop: 32 }}>
        <div className="mono caps" style={{
          fontSize: 10, color: 'var(--amber)', letterSpacing: '0.12em', marginBottom: 6,
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>📜 {tr('knowledge.section_categories', 'Explora por categoría')}</div>
        <h1 style={{
          fontFamily: 'var(--f-serif)', fontWeight: 400,
          fontSize: 'clamp(26px, 6vw, 36px)',
          lineHeight: 1.05, margin: 0,
          textShadow: '0 2px 12px rgba(0,0,0,0.55)',
        }}>{tr('knowledge.hub_title', 'Historia y Conocimiento')}</h1>
        <p style={{
          marginTop: 10, color: 'var(--ink-1)',
          fontSize: 14, lineHeight: 1.5, fontStyle: 'italic',
          textShadow: '0 1px 6px rgba(0,0,0,0.55)',
        }}>{tr('knowledge.hub_subtitle', 'Enciclopedia de la coctelería: técnicas, destilados, historia y cultura')}</p>
      </div>
    </div>

    {/* Category grid 2-col */}
    <div style={{ padding: '20px 20px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 720, margin: '0 auto' }}>
      {categories.map((cat) => {
        const title = tr('wiki.cat.' + cat.id, cat.id);
        const count = (cat.articles || []).length;
        return (
          <button key={cat.id}
            onClick={() => onOpen(cat)}
            className="card"
            style={{
              padding: 16, textAlign: 'left', cursor: 'pointer',
              background: cat.gradient || 'var(--bg-2)',
              border: 'none', color: '#fff',
              minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              gap: 8,
            }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>{cat.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.2 }}>{title}</div>
              <div className="mono caps" style={{ fontSize: 10, opacity: 0.85, marginTop: 4, letterSpacing: '0.08em' }}>
                {count} {tr('knowledge.articles', 'artículos')}{cat.has3d ? ' · 3D' : ''}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
const CategoryView = ({ tr, cat, onBack, onOpenArticle, onOpenFicha, onOpen3D }) => {
  if (!cat) return null;

  const title = tr('wiki.cat.' + cat.id, cat.id);
  const desc  = tr('wiki.cat.' + cat.id + '.desc', '');

  // Resolve an article click: prefer the POOL entry (has image + color),
  // otherwise build an ad-hoc entry so resolveArticle() can still read keys.
  const openArticle = (artId) => {
    const pool = (window.stArticles && window.stArticles.POOL) || [];
    const entry = pool.find((e) => e.cat === cat.id && e.art === artId) || {
      id: cat.id + '-' + artId,
      type: cat.id === 'history' ? 'history' : (cat.id === 'techniques' ? 'technique' : 'spirit'),
      cat: cat.id, art: artId,
      emoji: (cat.articles.find((a) => a.id === artId) || {}).icon || cat.icon,
      color: '#8e44ad',
    };
    onOpenArticle && onOpenArticle(entry);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '20px 20px 18px',
        background: cat.gradient || 'linear-gradient(160deg, var(--bg-2), var(--bg-1))',
        color: '#fff',
      }}>
        <button onClick={onBack}
          aria-label={tr('knowledge.back', 'Volver')}
          className="btn"
          style={{
            padding: 8, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)',
          }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 44, lineHeight: 1, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}>{cat.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--f-serif)', fontWeight: 400,
              fontSize: 'clamp(22px, 5vw, 30px)',
              lineHeight: 1.1, margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.55)',
            }}>{title}</h1>
            {desc && (
              <p style={{
                margin: '6px 0 0', fontSize: 13, lineHeight: 1.45,
                color: 'rgba(255,255,255,0.88)',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}>{desc}</p>
            )}
          </div>
        </div>
        {cat.has3d && (
          <button
            onClick={onOpen3D}
            className="btn"
            style={{
              marginTop: 14, padding: '8px 14px',
              background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.2)',
              color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.08em',
            }}>
            ⚙ {tr('knowledge.view_3d', 'Ver modelos 3D')}
          </button>
        )}
      </div>

      {/* Articles list */}
      <div style={{ padding: '20px 20px 32px', maxWidth: 720, margin: '0 auto', display: 'grid', gap: 10 }}>
        {(cat.articles || []).map((art) => {
          const artTitle = tr('wiki.art.' + cat.id + '.' + art.id, art.id);
          const artSub   = tr('wiki.art.' + cat.id + '.' + art.id + '.sub', '');
          return (
            <button key={art.id}
              onClick={() => openArticle(art.id)}
              className="card"
              style={{
                padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-1)',
                background: 'var(--bg-1)',
              }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{art.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 15, color: 'var(--ink-0)' }}>{artTitle}</div>
                {artSub && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{artSub}</div>}
              </div>
              <Icon name="arrowR" size={14} />
            </button>
          );
        })}
      </div>

      {/* History-specific curated sections — wired in D5/D6 */}
      {cat.id === 'history' && <HistoryCurated tr={tr} onOpenFicha={onOpenFicha} />}
    </div>
  );
};
const ThreeDView = ({ tr, cat, onBack }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'var(--bg-1)', borderBottom: '1px solid var(--border-1)',
    }}>
      <button onClick={onBack}
        aria-label={tr('knowledge.back', 'Volver')}
        className="btn"
        style={{ padding: 6, width: 36, height: 36, borderRadius: '50%' }}>
        <Icon name="arrowL" size={14} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15 }}>
          {cat ? (cat.icon + ' ' + tr('wiki.cat.' + cat.id, cat.id)) : tr('knowledge.view_3d', 'Ver modelos 3D')}
        </div>
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
          {tr('knowledge.view_3d', 'Ver modelos 3D')}
        </div>
      </div>
    </div>
    <iframe
      src={cat ? ('wiki.html?cat=' + encodeURIComponent(cat.id)) : 'wiki.html'}
      style={{ flex: 1, border: 'none', width: '100%' }}
      title={tr('knowledge.view_3d', 'Ver modelos 3D')}
    />
  </div>
);

// ─── History curated sections ───────────────────────────────────────────

const MILESTONES = [
  { year: '1806', key: 'knowledge.timeline.1806' },
  { year: '1862', key: 'knowledge.timeline.1862' },
  { year: '1920', key: 'knowledge.timeline.1920' },
  { year: '1934', key: 'knowledge.timeline.1934' },
  { year: '1951', key: 'knowledge.timeline.1951' },
  { year: '1955', key: 'knowledge.timeline.1955' },
  { year: '1987', key: 'knowledge.timeline.1987' },
  { year: '2005', key: 'knowledge.timeline.2005' },
  { year: '2015', key: 'knowledge.timeline.2015' },
];

const PEOPLE = [
  { id: 'jerry_thomas',    emoji: '🎩' },
  { id: 'ada_coleman',     emoji: '🌹' },
  { id: 'harry_craddock',  emoji: '📕' },
  { id: 'don_beachcomber', emoji: '🗿' },
  { id: 'dale_degroff',    emoji: '👑' },
];

const BARS = [
  { id: 'savoy',     emoji: '🏛️' },
  { id: 'harrys_ny', emoji: '🗼' },
  { id: 'floridita', emoji: '🌴' },
  { id: 'pegu_club', emoji: '🍸' },
];

const CuratedSection = ({ tr, eyebrow, title, children }) => (
  <section style={{ marginTop: 32 }}>
    <div className="mono caps" style={{
      fontSize: 10, color: 'var(--amber)', letterSpacing: '0.12em', marginBottom: 8,
    }}>{eyebrow}</div>
    <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 22, margin: '0 0 14px' }}>
      {title}
    </h2>
    {children}
  </section>
);

const AccordionCard = ({ emoji, title, body }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="card"
      style={{
        padding: 14, textAlign: 'left', cursor: 'pointer', width: '100%',
        border: '1px solid var(--border-1)', background: 'var(--bg-1)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</div>
        <div style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 15, flex: 1 }}>{title}</div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-2)' }}>
          {open ? '▾' : '▸'}
        </div>
      </div>
      {open && (
        <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-1)' }}>{body}</p>
      )}
    </button>
  );
};

const HistoryCurated = ({ tr, onOpenFicha }) => (
  <div style={{ padding: '8px 20px 40px', maxWidth: 720, margin: '0 auto' }}>
    {/* Timeline */}
    <CuratedSection tr={tr}
      eyebrow={'📅 ' + tr('knowledge.section_timeline', 'Línea del tiempo')}
      title={tr('knowledge.section_timeline', 'Línea del tiempo')}>
      <div style={{ display: 'grid', gap: 10 }}>
        {MILESTONES.map((m) => (
          <div key={m.year} className="card" style={{
            padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
            border: '1px solid var(--border-1)', background: 'var(--bg-1)',
          }}>
            <div className="mono" style={{
              fontWeight: 600, fontSize: 13, color: 'var(--amber)',
              minWidth: 52, letterSpacing: '0.04em',
            }}>{m.year}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-1)' }}>{tr(m.key, '')}</div>
          </div>
        ))}
      </div>
    </CuratedSection>

    {/* People */}
    <CuratedSection tr={tr}
      eyebrow={'👤 ' + tr('knowledge.section_people', 'Personajes legendarios')}
      title={tr('knowledge.section_people', 'Personajes legendarios')}>
      <div style={{ display: 'grid', gap: 10 }}>
        {PEOPLE.map((p) => (
          <AccordionCard key={p.id}
            emoji={p.emoji}
            title={tr('knowledge.person.' + p.id, p.id)}
            body={tr('knowledge.person.' + p.id + '.bio', '')} />
        ))}
      </div>
    </CuratedSection>

    {/* Bars */}
    <CuratedSection tr={tr}
      eyebrow={'🍸 ' + tr('knowledge.section_bars', 'Bares legendarios')}
      title={tr('knowledge.section_bars', 'Bares legendarios')}>
      <div style={{ display: 'grid', gap: 10 }}>
        {BARS.map((b) => (
          <AccordionCard key={b.id}
            emoji={b.emoji}
            title={tr('knowledge.bar.' + b.id, b.id)}
            body={tr('knowledge.bar.' + b.id + '.desc', '')} />
        ))}
      </div>
    </CuratedSection>

    {/* Cocktails with history — filled in D6 */}
    <HistoryCocktails tr={tr} onOpenFicha={onOpenFicha} />
  </div>
);

const HISTORY_FICHA_NAMES = [
  'Sazerac', 'Old Fashioned', 'Manhattan', 'Dry Martini', 'Negroni', 'Daiquiri',
];

const HistoryCocktails = ({ tr, onOpenFicha }) => {
  const all = window.ALL_FICHAS || [];
  const matches = HISTORY_FICHA_NAMES
    .map((name) => all.find((f) => f && f.name === name))
    .filter(Boolean);

  if (!matches.length) return null;

  const getImage = (f) =>
    (window.getFichaImage && window.getFichaImage(f.name)) || null;

  return (
    <CuratedSection tr={tr}
      eyebrow={'🍸 ' + tr('knowledge.section_cocktails', 'Cócteles con historia')}
      title={tr('knowledge.section_cocktails', 'Cócteles con historia')}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {matches.map((ficha) => {
          const img = getImage(ficha);
          return (
            <button key={ficha.name}
              onClick={() => onOpenFicha && onOpenFicha(ficha)}
              className="card"
              style={{
                padding: 0, cursor: 'pointer', textAlign: 'left',
                border: '1px solid var(--border-1)', background: 'var(--bg-1)',
                overflow: 'hidden',
              }}>
              <div style={{
                aspectRatio: '1.4',
                background: img
                  ? `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url(${img}) center/cover`
                  : 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                display: 'grid', placeItems: 'end', padding: 10,
              }}>
                {!img && <div style={{ fontSize: 32, color: '#fff' }}>{ficha.emoji || '🍸'}</div>}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 14 }}>{ficha.name}</div>
                <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-2)', letterSpacing: '0.08em', marginTop: 2 }}>
                  {tr('ficha.history', 'Historia')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </CuratedSection>
  );
};

Object.assign(window, { KnowledgeScreen });
