// ─── Stirio — ArticleScreen (Article of the Day reader) ───────────
// Depends on: ui.jsx (Icon, stUiT), articles.js (window.stArticles)
// Renders a full-screen reader with sections pulled from the Wiki i18n
// keys, so language changes re-render immediately.

// ─── Brands sub-section (per-spirit tasting fichas) ────────────────
// Reads window.SPIRIT_BRANDS (set by js/spirit-brands-data.js). Renders a
// list of brand cards inside spirit articles; click expands an inline ficha
// with two octagonal radar charts (Sabores / Aromas).

const REGION_FLAG = {
  do: '🇩🇴', cu: '🇨🇺', jm: '🇯🇲', gt: '🇬🇹', mx: '🇲🇽',
  ve: '🇻🇪', pa: '🇵🇦', ni: '🇳🇮', bb: '🇧🇧', pr: '🇵🇷',
  fr: '🇫🇷', mq: '🇲🇶', es: '🇪🇸', ie: '🇮🇪', us: '🇺🇸',
  uk: '🇬🇧', it: '🇮🇹', sc: '🇬🇧',
};
const flagFor = (region) => REGION_FLAG[region] || '🌎';
const titleCase = (id) => String(id || '')
  .split(/[-_]/).filter(Boolean)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

// Convert a ficha name to a normalized kebab-case ID for pairing lookups.
// "Cuba Libre" → "cuba-libre", "Whisky Sour" → "whisky-sour", "B-52" → "b-52".
const slugifyName = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Find a ficha that matches a brand pairing ID. Brand entries reference
// cocktails by kebab-case ID (e.g. 'cuba-libre'); fichas store the human name
// ('Cuba Libre'). Match by slug equality.
const findFichaByPairingId = (id) => {
  if (!id || !window.ALL_FICHAS) return null;
  const slug = String(id).toLowerCase();
  return window.ALL_FICHAS.find(f => slugifyName(f.name) === slug) || null;
};

const Radar = ({ values, labels, color, size = 320 }) => {
  const N = values.length;
  const cx = size / 2, cy = size / 2, rMax = size * 0.34;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const point = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

  const rings = [0.25, 0.5, 0.75, 1].map((f, idx) => {
    const pts = Array.from({ length: N }, (_, i) => {
      const [x, y] = point(i, rMax * f);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return <polygon key={idx} points={pts} fill="none" stroke="var(--line-soft)" strokeWidth="1" />;
  });
  const axes = Array.from({ length: N }, (_, i) => {
    const [x, y] = point(i, rMax);
    return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="var(--line-soft)" strokeWidth="1" />;
  });
  const dataPts = values.map((v, i) => {
    const r = rMax * Math.max(0, Math.min(100, v)) / 100;
    const [x, y] = point(i, r);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const labelEls = labels.map((label, i) => {
    const [x, y] = point(i, rMax + 18);
    let anchor = 'middle';
    if (x > cx + 6) anchor = 'start';
    else if (x < cx - 6) anchor = 'end';
    const dy = y < cy - 6 ? '0.2em' : (y > cy + 6 ? '0.85em' : '0.32em');
    return (
      <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor={anchor} dy={dy}
        style={{ fill: 'var(--ink-1)', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.04em' }}>
        {label}
      </text>
    );
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`}
      style={{ width: '100%', maxWidth: 320, height: 'auto', overflow: 'visible' }}
      role="img" aria-label={labels.join(', ')}>
      {rings}
      {axes}
      <polygon points={dataPts} fill={color} fillOpacity="0.32" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {labelEls}
    </svg>
  );
};

const InfoChip = ({ label, value }) => (
  <div style={{
    background: 'var(--bg-1)', border: '1px solid var(--line-soft)',
    borderRadius: 'var(--r-md)', padding: '8px 10px',
    display: 'flex', flexDirection: 'column', gap: 2,
  }}>
    <span className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{label}</span>
    <span style={{ fontSize: 14, color: 'var(--ink-0)' }}>{value}</span>
  </div>
);

const BrandFicha = ({ brand, tr }) => {
  const FLAVOR_AXES = window.FLAVOR_AXES || ['sweet','bitter','spiced','toasted','fruity','woody','smoky','herbal'];
  const AROMA_AXES  = window.AROMA_AXES  || ['vanilla','oak','caramel','spice','driedFruit','citrus','tobacco','cocoa'];
  const heroBg = `linear-gradient(135deg, ${brand.color || 'var(--bg-3)'} 0%, oklch(0.18 0.04 60) 100%)`;
  const aging = brand.aging_years ? `${brand.aging_years} ${tr('wiki.unit.years', 'años')}` : '—';
  const flavorVals = FLAVOR_AXES.map(k => brand.flavors?.[k] || 0);
  const flavorLabels = FLAVOR_AXES.map(k => tr('wiki.flavor.' + k, titleCase(k)));
  const aromaVals = AROMA_AXES.map(k => brand.aromas?.[k] || 0);
  const aromaLabels = AROMA_AXES.map(k => tr('wiki.aroma.' + k, titleCase(k)));
  const tasting = tr('wiki.brand.' + brand.id + '.tasting', '');
  const story   = tr('wiki.brand.' + brand.id + '.story', '');
  const pairing = brand.pairing || [];

  // tr returns the key when missing → treat that as empty
  const empty = (s, key) => !s || s === key;
  const tastingText = empty(tasting, 'wiki.brand.' + brand.id + '.tasting') ? '' : tasting;
  const storyText   = empty(story,   'wiki.brand.' + brand.id + '.story')   ? '' : story;

  return (
    <div style={{
      marginTop: 12, borderRadius: 'var(--r-lg)', overflow: 'hidden',
      border: '1px solid var(--line-soft)', background: 'var(--bg-1)',
    }}>
      <div style={{
        padding: '22px 22px 20px', display: 'flex', gap: 14, alignItems: 'center',
        background: heroBg, color: 'oklch(0.96 0.02 80)',
      }}>
        <span aria-hidden="true" style={{ fontSize: 42, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}>{flagFor(brand.region)}</span>
        <div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.05, textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>{brand.name}</div>
          <div className="mono caps" style={{ fontSize: 10, letterSpacing: '0.12em', opacity: 0.85, marginTop: 6 }}>
            {brand.producer || ''}{brand.year ? ' · ' + brand.year : ''}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8,
        padding: '14px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line-soft)',
      }}>
        <InfoChip label={tr('wiki.label.abv', 'Graduación')}     value={`${brand.abv}%`} />
        <InfoChip label={tr('wiki.label.aging', 'Añejamiento')}    value={aging} />
        <InfoChip label={tr('wiki.label.cask', 'Barrica')}         value={tr('wiki.cask.' + brand.cask, titleCase(brand.cask))} />
        <InfoChip label={tr('wiki.label.distillation', 'Destilación')} value={tr('wiki.distillation.' + brand.distillation, titleCase(brand.distillation))} />
        <InfoChip label={tr('wiki.label.producer', 'Productor')}   value={brand.producer || '—'} />
        <InfoChip label={tr('wiki.label.region', 'Origen')}        value={tr('wiki.region.' + brand.region, brand.region.toUpperCase())} />
      </div>

      <div style={{
        padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16,
        background: 'var(--bg-1)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em' }}>
            {tr('wiki.label.flavors', 'Sabores')}
          </div>
          <Radar values={flavorVals} labels={flavorLabels} color="oklch(0.82 0.17 75)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em' }}>
            {tr('wiki.label.aromas', 'Aromas')}
          </div>
          <Radar values={aromaVals} labels={aromaLabels} color="oklch(0.78 0.13 215)" />
        </div>
      </div>

      {tastingText && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line-soft)' }}>
          <h4 className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em', margin: '0 0 6px' }}>
            {tr('wiki.label.tasting', 'Notas de Cata')}
          </h4>
          <p style={{ margin: 0, color: 'var(--ink-1)', fontSize: 14, lineHeight: 1.6 }}>{tastingText}</p>
        </div>
      )}

      {pairing.length > 0 && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line-soft)' }}>
          <h4 className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em', margin: '0 0 8px' }}>
            {tr('wiki.label.pairing', 'Maridaje')}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pairing.map(id => {
              const label = tr('wiki.cocktail.' + id, titleCase(id));
              const ficha = findFichaByPairingId(id);
              const tag = ficha ? 'button' : 'span';
              const interactive = !!ficha;
              return React.createElement(tag, {
                key: id,
                type: ficha ? 'button' : undefined,
                onClick: ficha ? () => {
                  try { window.dispatchEvent(new CustomEvent('stirio:open-ficha', { detail: { ficha } })); } catch {}
                } : undefined,
                className: 'mono',
                style: {
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 'var(--r-pill)',
                  padding: '4px 10px',
                  fontSize: 12,
                  color: interactive ? 'var(--ink-1)' : 'var(--ink-2)',
                  cursor: interactive ? 'pointer' : 'default',
                  fontFamily: 'var(--f-mono)',
                  ...(interactive ? { transition: 'background 0.15s' } : {}),
                },
              }, label);
            })}
          </div>
        </div>
      )}

      {storyText && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line-soft)' }}>
          <h4 className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em', margin: '0 0 6px' }}>
            {tr('wiki.label.story', 'Historia')}
          </h4>
          <p style={{ margin: 0, color: 'var(--ink-1)', fontSize: 14, lineHeight: 1.6 }}>{storyText}</p>
        </div>
      )}
    </div>
  );
};

const BrandsSection = ({ spiritId, tr }) => {
  const brands = (window.SPIRIT_BRANDS && window.SPIRIT_BRANDS[spiritId]) || [];
  const [openId, setOpenId] = React.useState(null);
  if (!brands.length) return null;
  return (
    <section>
      <h2 className="mono caps" style={{
        color: 'var(--amber)', fontSize: 11, letterSpacing: '0.12em', margin: '0 0 8px',
      }}>
        {tr('wiki.label.brands', 'Marcas destacadas')}
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10,
      }}>
        {brands.map(b => {
          const open = openId === b.id;
          return (
            <button key={b.id} type="button"
              onClick={() => setOpenId(open ? null : b.id)}
              style={{
                textAlign: 'left',
                background: 'var(--bg-2)',
                border: '1px solid ' + (open ? 'var(--amber)' : 'var(--line-soft)'),
                boxShadow: open ? '0 0 0 1px var(--amber-soft)' : 'none',
                borderRadius: 'var(--r-md)', padding: '12px 14px',
                cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
                display: 'flex', flexDirection: 'column', gap: 6,
                transition: 'border-color .15s, background .15s, box-shadow .15s',
              }}>
              <span style={{ fontFamily: 'var(--f-serif)', fontSize: 16, color: 'var(--ink-0)', lineHeight: 1.2 }}>{b.name}</span>
              <span className="mono caps" style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
                fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em',
              }}>
                <span style={{
                  background: 'var(--amber-soft)', color: 'var(--amber)',
                  padding: '2px 8px', borderRadius: 'var(--r-pill)',
                  fontSize: 10, fontWeight: 600,
                }}>
                  {tr('wiki.style.' + b.style, b.style)}
                </span>
                <span aria-hidden="true" style={{ fontSize: 16 }}>{flagFor(b.region)}</span>
                <span>{b.abv}% ABV</span>
              </span>
            </button>
          );
        })}
      </div>
      {openId && (
        <BrandFicha brand={brands.find(b => b.id === openId)} tr={tr} />
      )}
    </section>
  );
};

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

        {/* Per-spirit brand fichas with hexagonal/octagonal radar profiles. */}
        {current.cat === 'spirits' && (
          <BrandsSection spiritId={current.art} tr={tr} />
        )}

        {/* Embedded mini Leaflet of the spirit's origin region(s). */}
        {current.cat === 'spirits' && window.MiniRegionMap && (
          <window.MiniRegionMap articleId={current.art} />
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
