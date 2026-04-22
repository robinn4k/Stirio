// ─── Stirio — ThreeDSection (inline R3F scene for articles) ──────────────
// Lazy-loads the Three.js engine (js/wiki-3d.js) and the scene builders
// (js/wiki-scenes.js) only when an article actually has a 3D model, so the
// CDN payload (~600 KB for three + addons) never hits the main bundle.
//
// Usage: inside ArticleScreen
//     {current.scene && window.ThreeDSection && (
//       <window.ThreeDSection sceneId={current.scene} />
//     )}
//
// Dependencies:
//   - index.html importmap (three, three/addons/)
//   - js/wiki-3d.js exporting { mountScene, dispose }
//   - js/wiki-scenes.js exporting { SCENE_BUILDERS }

const ThreeDSection = ({ sceneId, height = 280 }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const containerRef = React.useRef(null);
  const [status, setStatus] = React.useState('loading'); // loading | ready | error

  React.useEffect(() => {
    let alive = true;
    let disposeFn = null;

    const mount = async () => {
      try {
        const [engine, scenes] = await Promise.all([
          import('./wiki-3d.js'),
          import('./wiki-scenes.js'),
        ]);
        if (!alive) return;
        const builder = scenes.SCENE_BUILDERS && scenes.SCENE_BUILDERS[sceneId];
        const container = containerRef.current;
        if (!container || !builder) {
          setStatus('error');
          return;
        }
        engine.mountScene(container, (scene, camera, ctx) => builder(scene, camera, ctx));
        disposeFn = engine.dispose;
        setStatus('ready');
      } catch (err) {
        console.warn('[ThreeDSection] scene mount failed', sceneId, err);
        if (alive) setStatus('error');
      }
    };

    mount();

    return () => {
      alive = false;
      try { disposeFn && disposeFn(); } catch {}
    };
  }, [sceneId]);

  return (
    <div style={{
      position: 'relative',
      width: '100%', height,
      borderRadius: 'var(--r-lg, 22px)',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--bg-1), var(--bg-2))',
      border: '1px solid var(--line-soft, rgba(255,255,255,0.08))',
    }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {tr('knowledge.3d_loading', 'Cargando 3D…')}
        </div>
      )}
      {status === 'error' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          color: 'var(--ink-2)', textAlign: 'center', padding: 20, fontSize: 13,
        }}>
          <div>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.6 }}>⚙️</div>
            {tr('knowledge.3d_unavailable', 'Modelo 3D no disponible.')}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ThreeDSection });
