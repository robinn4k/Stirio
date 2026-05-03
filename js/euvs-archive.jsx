// Stirio — EuvsArchiveScreen.
// Catalog viewer for the EUVS Vintage Cocktail Books collection on
// Internet Archive. Loads data/euvs-catalog.json (network-first via SW
// runtime cache; not part of the precache budget — see sw.js comments).
// PDFs are NEVER served from the app: we only link out to archiveUrl.

const EuvsArchiveScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const utils = window.stEuvsUtils;

  const [status, setStatus]     = useState('loading'); // 'loading' | 'ready' | 'error'
  const [entries, setEntries]   = useState([]);
  const [query, setQuery]       = useState('');
  const [decade, setDecade]     = useState('all');
  const [language, setLanguage] = useState('all');

  useEffect(() => {
    let cancelled = false;
    fetch('data/euvs-catalog.json', { cache: 'default' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        const parsed = utils ? utils.parseCatalog(json) : [];
        parsed.sort((a, b) => a.year - b.year);
        setEntries(parsed);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = norm(query.trim());

  const decades   = useMemo(() => utils ? utils.uniqueDecades(entries)   : [], [entries]);
  const languages = useMemo(() => utils ? utils.uniqueLanguages(entries) : [], [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (utils) {
      list = utils.filterByDecade(list, decade);
      list = utils.filterByLanguage(list, language);
    }
    if (q) {
      list = list.filter(e =>
        norm(e.title).includes(q) ||
        (e.author && norm(e.author).includes(q))
      );
    }
    return list;
  }, [entries, decade, language, q]);

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={onBack} aria-label={tr('ui.back', 'Volver')} style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--cyan)', fontSize: 11 }}>{tr('euvs.eyebrow', 'archivo')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('euvs.header', 'EUVS Archive')}</h1>
        </div>
      </div>

      <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, marginTop: 0, marginBottom: 14 }}>
        {tr('euvs.intro', 'Colección de libros vintage de coctelería de la Exposition Universelle des Vins et Spiritueux, alojada en Internet Archive.')}
      </p>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={tr('euvs.search_placeholder', 'Buscar título o autor…')}
        style={{
          width: '100%', padding: '12px 14px', marginBottom: 12,
          borderRadius: 12, border: '1px solid var(--line)',
          background: 'var(--bg-2)', color: 'var(--ink-1)',
          fontFamily: 'inherit', fontSize: 15,
        }}
      />

      <FilterRow
        label={tr('euvs.filter.decade', 'Década')}
        all={tr('euvs.filter.all', 'Todas')}
        value={decade}
        options={decades}
        onChange={setDecade}
      />
      <FilterRow
        label={tr('euvs.filter.language', 'Idioma')}
        all={tr('euvs.filter.all', 'Todos')}
        value={language}
        options={languages}
        onChange={setLanguage}
      />

      {status === 'loading' && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.loading', 'Cargando catálogo…')}
        </div>
      )}
      {status === 'error' && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.error', 'No se pudo cargar el catálogo.')}
        </div>
      )}
      {status === 'ready' && filtered.length === 0 && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.empty', 'Sin resultados.')}
        </div>
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {filtered.map(entry => <BookCard key={entry.id} entry={entry} tr={tr} />)}
        </div>
      )}
    </div>
  );
};

const FilterRow = ({ label, all, value, options, onChange }) => {
  if (!options || options.length === 0) return null;
  const items = ['all', ...options];
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-2)', marginBottom: 6, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="chip"
            style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12,
              background: value === opt ? 'var(--cyan)' : 'var(--bg-2)',
              color: value === opt ? 'var(--bg-0)' : 'var(--ink-2)',
              border: '1px solid ' + (value === opt ? 'var(--cyan)' : 'var(--line)'),
              cursor: 'pointer',
            }}
          >
            {opt === 'all' ? all : opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const BookCard = ({ entry, tr }) => {
  const author = entry.author || tr('euvs.book.unknown_author', 'Autor desconocido');
  return (
    <article className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 17, margin: 0, flex: 1, minWidth: 0 }}>{entry.title}</h3>
        <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>{entry.year}</span>
      </div>
      <p style={{ margin: '0 0 8px', color: 'var(--ink-2)', fontSize: 13 }}>{author}</p>
      <div className="mono" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>
        <span>{entry.decade}</span>
        {entry.language && <span>{entry.language.toUpperCase()}</span>}
        {entry.pages != null && <span>{entry.pages} {tr('euvs.book.pages', 'pp')}</span>}
        {entry.sizeMb != null && <span>{entry.sizeMb} MB</span>}
      </div>
      <a
        href={entry.archiveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        {tr('euvs.book.archive_link', 'Ver en archive.org')} <Icon name="arrowR" size={12} />
      </a>
    </article>
  );
};

Object.assign(window, { EuvsArchiveScreen });
