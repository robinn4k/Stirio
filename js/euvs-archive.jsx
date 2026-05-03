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
  const [debug, setDebug]       = useState(null); // last failure reason for the empty-state card
  const [query, setQuery]       = useState('');
  const [decade, setDecade]     = useState('all');
  const [language, setLanguage] = useState('all');

  useEffect(() => {
    let cancelled = false;

    // window.stEuvsUtils is populated by an async <script type="module">
    // import; on slow connections the React tree can mount before the module
    // resolves. Read it lazily inside callbacks so the closure picks up the
    // current value rather than the stale undefined captured at render time.
    const getUtils = () => window.stEuvsUtils;

    // Wait briefly for the ES module to land before we touch any of its
    // exports. Polls every 50ms up to 5s. Resolves to the utils object or
    // null if it never appeared (in which case we fail loud rather than
    // silently rendering an empty grid).
    const waitForUtils = () => new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (cancelled) return resolve(null);
        const u = getUtils();
        if (u) return resolve(u);
        if (Date.now() - start > 5000) return resolve(null);
        setTimeout(tick, 50);
      };
      tick();
    });

    const finish = (parsed) => {
      if (cancelled) return;
      parsed.sort((a, b) => {
        const ay = a.year ?? Infinity;
        const by = b.year ?? Infinity;
        return ay - by;
      });
      setEntries(parsed);
      setDebug(null);
      setStatus('ready');
    };

    const fail = (reason) => {
      if (cancelled) return;
      setDebug(reason);
      setStatus('error');
    };

    const fetchFromArchive = () => {
      // Quote the collection identifier — Solr (archive.org's search
      // backend) treats hyphens as boolean NOT, so an unquoted
      // collection:vintage-cocktail-books-euvs is parsed as
      // "vintage NOT cocktail NOT books NOT euvs" and returns nothing.
      const url =
        'https://archive.org/advancedsearch.php' +
        '?q=collection%3A%22vintage-cocktail-books-euvs%22' +
        '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=year' +
        '&fl%5B%5D=creator&fl%5B%5D=language&fl%5B%5D=imagecount&fl%5B%5D=item_size' +
        '&rows=500&output=json';
      return fetch(url)
        .then(r => {
          if (!r.ok) throw new Error(`archive.org HTTP ${r.status}`);
          return r.json();
        })
        .then(json => {
          const u = getUtils();
          const docs = (json && json.response && json.response.docs) || [];
          if (!u) {
            fail(`utils missing after fetch (got ${docs.length} docs)`);
            return;
          }
          const parsed = docs.map(d => u.archiveDocToEntry(d)).filter(Boolean);
          if (parsed.length === 0 && docs.length > 0) {
            // archive.org responded but every doc was rejected — surface
            // the first identifier so we can see what's malformed.
            const sample = docs[0] && docs[0].identifier;
            fail(`archive.org returned ${docs.length} docs, all unparseable (e.g. "${sample}")`);
            return;
          }
          if (parsed.length === 0) {
            fail('archive.org returned 0 results for collection:vintage-cocktail-books-euvs');
            return;
          }
          finish(parsed);
        });
    };

    waitForUtils().then((u) => {
      if (cancelled) return;
      if (!u) {
        fail('euvs-archive-utils.js failed to load (window.stEuvsUtils undefined)');
        return;
      }
      fetch('data/euvs-catalog.json', { cache: 'default' })
        .then(r => {
          if (!r.ok) throw new Error(`local catalog HTTP ${r.status}`);
          return r.json();
        })
        .then(json => {
          if (cancelled) return;
          const parsed = u.parseCatalog(json);
          if (parsed.length > 0) {
            finish(parsed);
          } else {
            fetchFromArchive().catch((err) => {
              fail(String(err && err.message || err));
            });
          }
        })
        .catch(() => {
          // Local catalog missing / unreadable — try archive.org directly.
          fetchFromArchive().catch((err) => {
            fail(String(err && err.message || err));
          });
        });
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
          {debug && (
            <div className="mono" style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-2)', wordBreak: 'break-word', opacity: 0.7 }}>
              {debug}
            </div>
          )}
        </div>
      )}
      {status === 'ready' && filtered.length === 0 && entries.length === 0 && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.5 }}>
          {tr('euvs.unpopulated', 'El catálogo aún no ha sido generado. Ejecuta tools/euvs-archive/build_catalog.py para poblarlo desde Internet Archive.')}
        </div>
      )}
      {status === 'ready' && filtered.length === 0 && entries.length > 0 && (
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
