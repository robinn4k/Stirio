// Stirio — GlossaryScreen: searchable bartending glossary.
// Term/def text falls back to Spanish; translations land via `glossary.term.<id>` /
// `glossary.def.<id>` keys in i18n/*.json (follow-up PRs).

const GLOSSARY_TERMS = [
  { id: 'shake', cat: 'tech', term: 'Shake', def: 'Agitar los ingredientes con hielo en una coctelera para enfriar, diluir y aerear.' },
  { id: 'stir', cat: 'tech', term: 'Stir', def: 'Remover con cuchara en un vaso mezclador para enfriar y diluir sin aerear.' },
  { id: 'muddle', cat: 'tech', term: 'Muddle', def: 'Prensar frutas, hierbas o especias con un mortero para liberar aromas y jugos.' },
  { id: 'build', cat: 'tech', term: 'Build', def: 'Construir el cóctel directamente en el vaso de servicio, sin agitar ni remover fuera.' },
  { id: 'layer', cat: 'tech', term: 'Layer', def: 'Verter ingredientes en capas separadas por densidad usando el dorso de una cuchara.' },
  { id: 'strain', cat: 'tech', term: 'Strain', def: 'Colar el cóctel para separar hielo y sólidos al servir.' },
  { id: 'double-strain', cat: 'tech', term: 'Doble colado', def: 'Usar colador fino sobre el hawthorne para retener restos de hierba o pulpa.' },
  { id: 'dry-shake', cat: 'tech', term: 'Dry shake', def: 'Agitar sin hielo (normalmente con clara de huevo) para generar espuma antes del shake con hielo.' },
  { id: 'fat-wash', cat: 'tech', term: 'Fat wash', def: 'Infusionar un destilado con grasa (mantequilla, bacon) y congelar para filtrarla.' },
  { id: 'infusion', cat: 'tech', term: 'Infusión', def: 'Macerar ingredientes en un destilado para transferir sabor y color.' },
  { id: 'swizzle', cat: 'tech', term: 'Swizzle', def: 'Mezclar con palo swizzle haciendo girar entre las palmas, típico de cócteles tiki.' },
  { id: 'rinse', cat: 'tech', term: 'Rinse', def: 'Enjuagar el vaso con un destilado aromático (absinthe, mezcal) y descartar el exceso.' },
  { id: 'float', cat: 'tech', term: 'Float', def: 'Hacer flotar un licor menos denso sobre la superficie del cóctel.' },

  { id: 'jigger', cat: 'tool', term: 'Jigger', def: 'Medidor de doble cono (15/30 ml o 30/45 ml) para dosificar con precisión.' },
  { id: 'boston', cat: 'tool', term: 'Boston shaker', def: 'Coctelera de dos piezas (vaso + tin metálico) usada por la mayoría de bartenders.' },
  { id: 'cobbler', cat: 'tool', term: 'Cobbler shaker', def: 'Coctelera de tres piezas con colador integrado, popular en Japón.' },
  { id: 'hawthorne', cat: 'tool', term: 'Hawthorne', def: 'Colador metálico con muelle que se ajusta al tin o vaso mezclador.' },
  { id: 'mixing-glass', cat: 'tool', term: 'Vaso mezclador', def: 'Vaso pesado para remover cócteles stirred (Martini, Manhattan).' },
  { id: 'barspoon', cat: 'tool', term: 'Barspoon', def: 'Cuchara larga de mango en espiral para remover y hacer layers.' },
  { id: 'muddler', cat: 'tool', term: 'Muddler', def: 'Mortero grueso (madera o plástico) para prensar ingredientes.' },
  { id: 'fine-strainer', cat: 'tool', term: 'Colador fino', def: 'Colador de malla tupida para doble colado.' },

  { id: 'coupe', cat: 'glass', term: 'Coupe', def: 'Copa plana y ancha, históricamente usada para champán, hoy para cócteles sin hielo.' },
  { id: 'martini', cat: 'glass', term: 'Martini', def: 'Copa cónica con pie largo. Para cócteles cortos sin hielo.' },
  { id: 'highball', cat: 'glass', term: 'Highball', def: 'Vaso alto y recto (~300 ml) para tragos largos con hielo.' },
  { id: 'rocks', cat: 'glass', term: 'Rocks / Old-Fashioned', def: 'Vaso bajo y ancho (~250 ml) para cócteles on the rocks.' },
  { id: 'collins', cat: 'glass', term: 'Collins', def: 'Vaso más alto y estrecho que el highball, para Tom Collins y similares.' },
  { id: 'nick-nora', cat: 'glass', term: 'Nick & Nora', def: 'Copa pequeña con forma de campana, elegante para cócteles stirred.' },

  { id: 'bitters', cat: 'ing', term: 'Bitters', def: 'Amargos concentrados (Angostura, Peychaud) que aportan profundidad al cóctel.' },
  { id: 'vermouth', cat: 'ing', term: 'Vermut', def: 'Vino fortificado aromatizado con hierbas. Seco o dulce (rojo).' },
  { id: 'orgeat', cat: 'ing', term: 'Orgeat', def: 'Jarabe de almendras con agua de azahar, clave en cócteles tiki.' },
  { id: 'falernum', cat: 'ing', term: 'Falernum', def: 'Jarabe/licor caribeño de jengibre, lima, clavo y almendra.' },
  { id: 'triple-sec', cat: 'ing', term: 'Triple sec', def: 'Licor de naranja seco (Cointreau, Combier) usado en Margarita y Sidecar.' },
];

const GLOSSARY_CATS = {
  all:   { label: 'Todo', icon: '✦' },
  tech:  { label: 'Técnicas', icon: '🔧' },
  tool:  { label: 'Herramientas', icon: '🛠️' },
  glass: { label: 'Cristalería', icon: '🥃' },
  ing:   { label: 'Ingredientes', icon: '🍋' },
};

const GlossaryScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = norm(query.trim());
  const localizedTerm = (item) => tr(`glossary.term.${item.id}`, item.term);
  const localizedDef  = (item) => tr(`glossary.def.${item.id}`,  item.def);
  const filtered = GLOSSARY_TERMS.filter(item => {
    if (cat !== 'all' && item.cat !== cat) return false;
    if (!q) return true;
    return norm(localizedTerm(item)).includes(q) || norm(localizedDef(item)).includes(q);
  });

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={onBack} aria-label={tr('ui.back', 'Volver')} style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('glossary.eyebrow', 'referencia')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('glossary.header', 'Glosario')}</h1>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={tr('glossary.search_placeholder', 'Buscar término o definición…')}
        style={{
          width: '100%', padding: '12px 14px', marginBottom: 12,
          borderRadius: 12, border: '1px solid var(--line)',
          background: 'var(--bg-2)', color: 'var(--ink-1)',
          fontFamily: 'inherit', fontSize: 15,
        }}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {Object.entries(GLOSSARY_CATS).map(([k, c]) => (
          <button key={k} onClick={() => setCat(k)} className="chip" style={{
            padding: '6px 12px', borderRadius: 99, fontSize: 12,
            background: cat === k ? 'var(--amber)' : 'var(--bg-2)',
            color: cat === k ? 'var(--bg-0)' : 'var(--ink-2)',
            border: '1px solid ' + (cat === k ? 'var(--amber)' : 'var(--line)'),
            cursor: 'pointer',
          }}>
            {c.icon} {tr(`glossary.cat.${k}`, c.label)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('glossary.empty', 'Sin resultados.')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(item => (
            <div key={item.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 17, margin: 0 }}>{localizedTerm(item)}</h3>
                <span className="mono caps" style={{ fontSize: 10, color: 'var(--amber)' }}>
                  {tr(`glossary.cat.${item.cat}`, GLOSSARY_CATS[item.cat].label)}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5 }}>{localizedDef(item)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { GlossaryScreen, GLOSSARY_TERMS });
