// Stirio — EuvsArchiveScreen + BookDetailScreen.
// In-app reader for the EUVS Vintage Cocktail Books collection. The catalog
// (data/euvs-catalog.json) is a lightweight index built from data/euvs-books/
// by tools/euvs-archive/build_catalog.py. Each book file holds the full
// content (metadata + sections + recipes) following the schema in
// tools/euvs-archive/_SCHEMA.md.

const EuvsArchiveScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const utils = window.stEuvsUtils;

  const [status, setStatus]     = useState('loading'); // 'loading' | 'ready' | 'error'
  const [entries, setEntries]   = useState([]);
  const [debug, setDebug]       = useState(null);
  const [query, setQuery]       = useState('');
  const [decade, setDecade]     = useState('all');
  const [language, setLanguage] = useState('all');
  const [openBook, setOpenBook] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const getUtils = () => window.stEuvsUtils;

    // window.stEuvsUtils is populated by an async <script type="module">
    // import; on slow connections the React tree can mount before the module
    // resolves. Poll every 50ms up to 5s, then fail loud.
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

    waitForUtils().then((u) => {
      if (cancelled) return;
      if (!u) {
        setDebug('euvs-archive-utils.js failed to load');
        setStatus('error');
        return;
      }
      fetch('data/euvs-catalog.json', { cache: 'default' })
        .then(r => {
          if (!r.ok) throw new Error(`catalog HTTP ${r.status}`);
          return r.json();
        })
        .then(json => {
          if (cancelled) return;
          const parsed = u.parseCatalog(json);
          parsed.sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
          setEntries(parsed);
          setStatus('ready');
        })
        .catch((err) => {
          if (cancelled) return;
          setDebug(String(err && err.message || err));
          setStatus('error');
        });
    });
    return () => { cancelled = true; };
  }, []);

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

  if (openBook) {
    return <BookDetailScreen entry={openBook} onBack={() => setOpenBook(null)} />;
  }

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
        {tr('euvs.intro', 'Biblioteca de libros vintage de coctelería con texto original y traducción al español, sección por sección.')}
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
      {status === 'ready' && filtered.length === 0 && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.empty', 'Sin resultados.')}
        </div>
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {filtered.map(entry => (
            <BookCard key={entry.id} entry={entry} tr={tr} onOpen={() => setOpenBook(entry)} />
          ))}
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

const BookCard = ({ entry, tr, onOpen }) => {
  const author = entry.author || tr('euvs.book.unknown_author', 'Autor desconocido');
  return (
    <article
      className="card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      style={{ padding: 14, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 17, margin: 0, flex: 1, minWidth: 0 }}>{entry.title}</h3>
        <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>{entry.year}</span>
      </div>
      <p style={{ margin: '0 0 8px', color: 'var(--ink-2)', fontSize: 13 }}>{author}</p>
      <div className="mono" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--ink-3)', marginBottom: 8 }}>
        <span>{entry.decade}</span>
        {entry.language && <span>{entry.language.toUpperCase()}</span>}
        {entry.publisher && <span>{entry.publisher}</span>}
        {entry.city && <span>{entry.city}</span>}
      </div>
      {entry.notes && (
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.4, opacity: 0.85 }}>
          {entry.notes.length > 200 ? entry.notes.slice(0, 200).trim() + '…' : entry.notes}
        </p>
      )}
      <div className="mono" style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-3)', marginTop: 10 }}>
        {entry.sectionCount > 0 && (
          <span>{tr('euvs.book.sections', '{n} secciones').replace('{n}', entry.sectionCount)}</span>
        )}
        {entry.recipeCount > 0 && (
          <span>{tr('euvs.book.recipes', '{n} recetas').replace('{n}', entry.recipeCount)}</span>
        )}
      </div>
    </article>
  );
};

const BookDetailScreen = ({ entry, onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));

  const [status, setStatus] = useState('loading');
  const [book, setBook]     = useState(null);
  const [debug, setDebug]   = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!entry || !entry.bookFile) {
      setDebug('missing bookFile');
      setStatus('error');
      return () => {};
    }
    fetch(entry.bookFile, { cache: 'default' })
      .then(r => {
        if (!r.ok) throw new Error(`book HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        setBook(json);
        setStatus('ready');
      })
      .catch(err => {
        if (cancelled) return;
        setDebug(String(err && err.message || err));
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, [entry]);

  const sections = (book && Array.isArray(book.sections)) ? book.sections : [];

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={onBack} aria-label={tr('ui.back', 'Volver')} style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--cyan)', fontSize: 11 }}>{entry.year}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 22, margin: 0, lineHeight: 1.2 }}>{entry.title}</h1>
        </div>
      </div>

      <div style={{ marginBottom: 14, color: 'var(--ink-2)', fontSize: 13 }}>
        {entry.author && <div>{entry.author}</div>}
        <div className="mono" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
          {entry.publisher && <span>{tr('euvs.book.publisher', 'Editorial')}: {entry.publisher}</span>}
          {entry.city && <span>{tr('euvs.book.city', 'Ciudad')}: {entry.city}</span>}
          {entry.edition && <span>{tr('euvs.book.edition', 'Edición')}: {entry.edition}</span>}
          {entry.languageName && <span>{entry.languageName}</span>}
        </div>
      </div>

      {entry.notes && (
        <p style={{ margin: '0 0 16px', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.5 }}>
          {entry.notes}
        </p>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setShowOriginal(false)}
          className="chip"
          style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12,
            background: !showOriginal ? 'var(--cyan)' : 'var(--bg-2)',
            color: !showOriginal ? 'var(--bg-0)' : 'var(--ink-2)',
            border: '1px solid ' + (!showOriginal ? 'var(--cyan)' : 'var(--line)'),
            cursor: 'pointer',
          }}
        >
          {tr('euvs.detail.toggle_es', 'Español')}
        </button>
        <button
          onClick={() => setShowOriginal(true)}
          className="chip"
          style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12,
            background: showOriginal ? 'var(--cyan)' : 'var(--bg-2)',
            color: showOriginal ? 'var(--bg-0)' : 'var(--ink-2)',
            border: '1px solid ' + (showOriginal ? 'var(--cyan)' : 'var(--line)'),
            cursor: 'pointer',
          }}
        >
          {tr('euvs.detail.toggle_original', 'Original')}
        </button>
      </div>

      {status === 'loading' && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.detail.loading', 'Cargando libro…')}
        </div>
      )}
      {status === 'error' && (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
          {tr('euvs.detail.error', 'No se pudo cargar el libro.')}
          {debug && (
            <div className="mono" style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-2)', wordBreak: 'break-word', opacity: 0.7 }}>
              {debug}
            </div>
          )}
        </div>
      )}
      {status === 'ready' && sections.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {sections.map((s, i) => (
            <SectionCard
              key={s.order ?? i}
              section={s}
              showOriginal={showOriginal}
              recipeCount={(book.recipes || []).filter(r => r.section_title === s.title).length}
              tr={tr}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ section, showOriginal, recipeCount, tr }) => {
  const title = showOriginal ? (section.title || section.title_es) : (section.title_es || section.title);
  const content = showOriginal ? section.content_original : section.content_es;
  const isRecipesSection = section.type === 'recipes_section' && !content;

  return (
    <article className="card" style={{ padding: 14 }}>
      <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 4, letterSpacing: '0.08em' }}>
        {section.type || 'section'}
      </div>
      <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 16, margin: '0 0 8px' }}>{title}</h3>
      {content && (
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      )}
      {isRecipesSection && (
        <p style={{ margin: 0, color: 'var(--ink-3)', fontSize: 12, fontStyle: 'italic' }}>
          {tr('euvs.detail.recipes_placeholder', 'Sección de recetas — {n} recetas').replace('{n}', recipeCount)}
        </p>
      )}
    </article>
  );
};

Object.assign(window, { EuvsArchiveScreen, BookDetailScreen });
