// Stirio — Admin console (read-only) for the maintainer.
// Three panels:
//   1. i18n coverage % per language (computed locally against es.json baseline,
//      excluding PARITY_EXCLUDE_PREFIXES so pending-debt isn't flagged).
//   2. Recent runs of .github/workflows/ai-content.yml — fetched from the
//      public GitHub REST API (no auth needed for public repos; CORS allowed).
//   3. Open PRs whose title starts with "AI content" — i.e. PRs the workflow
//      opened that haven't been merged yet.
//
// Gated by `currentUser.email === ADMIN_EMAIL`. Lightweight client-side gate
// — appropriate because every panel is read-only and the data is public.
// Firestore rules already protect any sensitive collections (we don't touch
// them here).
//
// Cross-origin fetches to api.github.com bypass the SW cache (sw.js:256), so
// online-only by design. The coverage panel still works offline because i18n
// JSONs are precached.

const ADMIN_EMAIL = 'robinn4k@gmail.com';
const REPO_OWNER = 'robinn4k';
const REPO_NAME = 'Stirio';
const WORKFLOW_FILE = 'ai-content.yml';
const GITHUB_API = 'https://api.github.com';

function isAdminUser() {
  const me = window.stAuth?.getCurrentUser?.();
  if (!me || me.isGuest) return false;
  const email = (me.email || '').trim().toLowerCase();
  const ok = email === ADMIN_EMAIL;
  if (!ok && email) console.info('[admin] gate denied for', email);
  return ok;
}

const AdminScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [coverage, setCoverage] = React.useState(null);
  const [runs, setRuns] = React.useState({ status: 'loading', items: [], error: null });
  const [prs, setPrs] = React.useState({ status: 'loading', items: [], error: null });
  const [refreshTick, setRefreshTick] = React.useState(0);

  // Coverage: pure client-side, computed from cached i18n JSONs.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cov = await window.stLang?.getCoverage?.();
        if (!cancelled && cov) setCoverage(cov);
      } catch (e) {
        if (!cancelled) setCoverage({ error: String(e?.message || e) });
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  // GitHub API: 60 req/h unauth; one fetch per panel per refresh.
  React.useEffect(() => {
    let cancelled = false;
    setRuns({ status: 'loading', items: [], error: null });
    fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=15`
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const items = (data.workflow_runs || []).map(run => ({
          id: run.id,
          name: run.display_title || run.name || `run ${run.id}`,
          status: run.status, // queued | in_progress | completed
          conclusion: run.conclusion, // success | failure | cancelled | null
          created_at: run.created_at,
          html_url: run.html_url,
        }));
        setRuns({ status: 'ready', items, error: null });
      })
      .catch(err => {
        if (!cancelled) setRuns({ status: 'error', items: [], error: String(err?.message || err) });
      });
    return () => { cancelled = true; };
  }, [refreshTick]);

  React.useEffect(() => {
    let cancelled = false;
    setPrs({ status: 'loading', items: [], error: null });
    fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&per_page=30`
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const items = (Array.isArray(data) ? data : [])
          .filter(pr => typeof pr.title === 'string' && pr.title.startsWith('AI content'))
          .map(pr => ({
            number: pr.number,
            title: pr.title,
            draft: !!pr.draft,
            head: pr.head?.ref || '',
            html_url: pr.html_url,
            created_at: pr.created_at,
          }));
        setPrs({ status: 'ready', items, error: null });
      })
      .catch(err => {
        if (!cancelled) setPrs({ status: 'error', items: [], error: String(err?.message || err) });
      });
    return () => { cancelled = true; };
  }, [refreshTick]);

  // Per-render gate fallback: if someone navigates here without being admin,
  // bounce back. (The Profile entrypoint also gates the row, but defence in
  // depth is cheap.)
  if (!isAdminUser()) {
    return (
      <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: 8, marginBottom: 18 }}>
          <Icon name="arrowL" size={18} /> Back
        </button>
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)' }}>
          {tr('admin.gate_denied', 'Esta consola es solo para el administrador.')}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: 8 }}>
          <Icon name="arrowL" size={18} /> Back
        </button>
        <button
          className="btn ghost"
          onClick={() => setRefreshTick(t => t + 1)}
          style={{ padding: '6px 12px', fontFamily: 'var(--f-mono)', fontSize: 11 }}
          aria-label={tr('admin.refresh', 'Actualizar')}
        >
          <Icon name="refresh" size={14} /> {tr('admin.refresh', 'Actualizar')}
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, marginBottom: 4 }}>
          admin
        </div>
        <h1 style={{
          fontFamily: 'var(--f-serif)', fontSize: 32, fontWeight: 400,
          margin: 0, letterSpacing: '-0.02em',
        }}>
          {tr('admin.title', 'Consola admin')}
        </h1>
      </div>

      {/* Panel 1 — i18n coverage */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.coverage_eyebrow', 'i18n')}
          title={tr('admin.coverage_title', 'Cobertura de traducciones')}
        />
        <div className="card" style={{ padding: 18 }}>
          <CoverageList data={coverage} tr={tr} />
        </div>
      </section>

      {/* Panel 2 — recent workflow runs */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.runs_eyebrow', 'github actions')}
          title={tr('admin.runs_title', 'Últimas ejecuciones de la IA')}
        />
        <div className="card" style={{ padding: 4 }}>
          <RunsList state={runs} tr={tr} />
        </div>
      </section>

      {/* Panel 3 — open PRs */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.prs_eyebrow', 'pull requests')}
          title={tr('admin.prs_title', 'PRs abiertos por la IA')}
        />
        <div className="card" style={{ padding: 4 }}>
          <PrsList state={prs} tr={tr} />
        </div>
      </section>

      <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--f-mono)' }}>
        {tr('admin.footer_note', 'Datos públicos · 60 req/h por IP · sin estado en cliente')}
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

const CoverageList = ({ data, tr }) => {
  if (!data) return <Skeleton lines={4} />;
  if (data.error) {
    return (
      <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
        {tr('admin.coverage_error', 'No se pudo calcular la cobertura:')} {data.error}
      </div>
    );
  }
  const langs = ['en', 'fr', 'pt', 'de'];
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
        {tr('admin.coverage_baseline', 'baseline ES')}: {data.baseline} {tr('admin.coverage_keys', 'claves')}
      </div>
      {langs.map(lang => {
        const row = data[lang] || { translated: 0, missing: 0, percent: 0 };
        const pct = Math.round(row.percent * 100);
        const color = pct >= 95 ? 'var(--mint, var(--amber))' : pct >= 80 ? 'var(--amber)' : 'var(--berry)';
        return (
          <div key={lang}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, textTransform: 'uppercase' }}>
                {lang}
              </span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)' }}>
                {row.translated}/{data.baseline} · {pct}%
              </span>
            </div>
            <div style={{
              height: 6, background: 'var(--bg-2)', borderRadius: 99,
              border: '1px solid var(--line-soft)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: color, transition: 'width .3s',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RunsList = ({ state, tr }) => {
  if (state.status === 'loading') return <div style={{ padding: 14 }}><Skeleton lines={3} /></div>;
  if (state.status === 'error') return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.offline_warning', 'Sin conexión a la API de GitHub.')} {state.error}
    </div>
  );
  if (!state.items.length) return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.runs_empty', 'Aún no hay ejecuciones.')}
    </div>
  );
  return state.items.map(run => {
    const conclusionIcon = run.conclusion === 'success' ? '✅'
      : run.conclusion === 'failure' ? '🔴'
      : run.conclusion === 'cancelled' ? '⏹'
      : run.status === 'in_progress' ? '⏳'
      : run.status === 'queued' ? '🟡' : '⚪';
    return (
      <a
        key={run.id}
        href={run.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', borderRadius: 'var(--r-md)',
          textDecoration: 'none', color: 'inherit',
        }}
      >
        <div style={{ fontSize: 18 }}>{conclusionIcon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{run.name}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
            {run.conclusion || run.status} · {formatRelative(run.created_at)}
          </div>
        </div>
      </a>
    );
  });
};

const PrsList = ({ state, tr }) => {
  if (state.status === 'loading') return <div style={{ padding: 14 }}><Skeleton lines={3} /></div>;
  if (state.status === 'error') return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.offline_warning', 'Sin conexión a la API de GitHub.')} {state.error}
    </div>
  );
  if (!state.items.length) return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.prs_empty', 'No hay PRs abiertos por la IA.')}
    </div>
  );
  return state.items.map(pr => (
    <a
      key={pr.number}
      href={pr.html_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 'var(--r-md)',
        textDecoration: 'none', color: 'inherit',
      }}
    >
      <div style={{ fontSize: 18 }}>{pr.draft ? '📝' : '📬'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>#{pr.number} · {pr.title}</div>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
          {pr.draft ? tr('admin.pr_draft', 'draft') : tr('admin.pr_open', 'open')} · {formatRelative(pr.created_at)}
        </div>
      </div>
    </a>
  ));
};

const Skeleton = ({ lines = 3 }) => (
  <div style={{ display: 'grid', gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{
        height: 12, borderRadius: 6,
        background: 'var(--bg-2)',
        opacity: 0.6 + (i % 2) * 0.2,
        width: `${60 + (i * 10) % 40}%`,
      }} />
    ))}
  </div>
);

function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

Object.assign(window, { AdminScreen, isAdminUser });
