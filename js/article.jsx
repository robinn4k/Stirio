// ─── Stirio — ArticleScreen (Article of the Day reader) ───────────
// Depends on: ui.jsx (Icon, stUiT), articles.js (window.stArticles)
// Renders a full-screen reader with sections pulled from the Wiki i18n
// keys, so language changes re-render immediately.

const ArticleScreen = ({ article, onBack, onOpenWiki }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));

  // Guard: if no article is passed, try to resolve today's article (robustness
  // against stale state after language changes).
  const current = article || (window.stArticles && window.stArticles.getArticleOfTheDay());
  if (!current) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📰</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{tr('article.unavailable', 'Sin artículo disponible')}</h2>
          <button className="btn primary" onClick={onBack} style={{ marginTop: 12 }}>
            {tr('article.close', 'Cerrar')}
          </button>
        </div>
      </div>
    );
  }

  const typeLabelKey = 'article.type.' + current.type;
  const typeFallback = { technique: 'Técnica', spirit: 'Destilado', history: 'Historia', trend: 'Tendencia', cocktail: 'Cóctel' }[current.type] || 'Artículo';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg-0)',
      overflowY: 'auto',
      animation: 'fadeIn .3s ease',
      paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0))',
    }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        padding: '24px 24px 32px',
        background: current.image
          ? `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, oklch(0.18 0.03 60 / 0.88) 85%), url(${current.image}) center/cover`
          : `linear-gradient(160deg, ${current.color || 'var(--bg-2)'} 0%, oklch(0.2 0.03 60) 100%)`,
        minHeight: 300,
      }}>
        <button onClick={onBack}
          aria-label={tr('article.close', 'Cerrar')}
          className="btn"
          style={{
            padding: 8, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)',
          }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          {!current.image && (
            <div style={{
              fontSize: 64,
              filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))',
            }}>{current.emoji}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono caps" style={{
              fontSize: 10, color: 'var(--amber)', letterSpacing: '0.12em', marginBottom: 4,
              textShadow: current.image ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
            }}>
              {current.image && <span style={{ marginRight: 6 }}>{current.emoji}</span>}
              {tr('home.article_eyebrow', 'Artículo del día')} · {tr(typeLabelKey, typeFallback)}
            </div>
            <h1 style={{
              fontFamily: 'var(--f-serif)', fontWeight: 400,
              fontSize: 'clamp(28px, 6vw, 40px)',
              lineHeight: 1.05, margin: 0,
              textShadow: current.image ? '0 2px 12px rgba(0,0,0,0.7)' : 'none',
            }}>{current.title}</h1>
          </div>
        </div>
        {current.excerpt && (
          <p style={{
            marginTop: 18, color: 'var(--ink-1)',
            fontSize: 15, lineHeight: 1.5, fontStyle: 'italic',
            textShadow: current.image ? '0 1px 8px rgba(0,0,0,0.7)' : 'none',
          }}>{current.excerpt}</p>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: '24px 24px 40px', display: 'grid', gap: 20, maxWidth: 720, margin: '0 auto' }}>
        {/* Inline 3D model (lazy-loaded). Rendered between the hero and the
            text sections so it reads like a visual introduction — e.g. the
            alambique for the Destilación article. */}
        {current.scene && window.ThreeDSection && (
          <section>
            <h2 className="mono caps" style={{
              color: 'var(--amber)', fontSize: 11, letterSpacing: '0.12em',
              margin: '0 0 8px',
            }}>
              {tr('article.section.3d', 'Modelo 3D')}
            </h2>
            <window.ThreeDSection sceneId={current.scene} />
          </section>
        )}
        {current.sections.map((s, i) => (
          <section key={i}>
            <h2 className="mono caps" style={{
              color: 'var(--amber)', fontSize: 11, letterSpacing: '0.12em',
              margin: '0 0 8px',
            }}>
              {tr(s.label, s.label.replace('article.section.', ''))}
            </h2>
            <p style={{
              fontSize: 15, lineHeight: 1.6, color: 'var(--ink-1)',
              margin: 0, whiteSpace: 'pre-line',
            }}>{s.text}</p>
          </section>
        ))}
        {current.sections.length === 0 && !current.scene && (
          <div className="card" style={{ padding: 20, color: 'var(--ink-2)', textAlign: 'center' }}>
            {tr('wiki.article.empty', 'Pronto añadiremos más contenido para este artículo.')}
          </div>
        )}

        {/* CTA — open the full encyclopedia for more depth */}
        {onOpenWiki && (
          <button className="btn primary" onClick={onOpenWiki} style={{ justifySelf: 'start', padding: '10px 16px' }}>
            {tr('article.open_in_wiki', 'Ver en la Enciclopedia')} <Icon name="arrowR" size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ArticleScreen });
