// Stirio — LibraryScreen: iframe wrapper to wiki.html (3D-only filter).
// wiki.html renders its own header; listen for the `wiki-close` postMessage
// it emits from the root view to close back to the SPA.

const LibraryScreen = ({ onBack }) => {
  useEffect(() => {
    const onMsg = (e) => {
      if (e && e.data && e.data.type === 'wiki-close') onBack && onBack();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onBack]);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn .3s ease',
    }}>
      <iframe
        src="wiki.html?filter=3d"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Biblioteca 3D"
      />
    </div>
  );
};

Object.assign(window, { LibraryScreen });
