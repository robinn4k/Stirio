// Stirio — Components shared across screen files.
// When a screen-level helper (section header, tile wrapper, etc.) is used by
// more than one of Onboarding/Home/Profile/ModeSheet, lift it here instead of
// relying on Babel classic-script top-level scope order. Keeps split files
// from silently depending on each other's load order.

const SectionHeader = ({ eyebrow, title, action }) => (
  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
    <div>
      <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, marginBottom: 2 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
    {action}
  </div>
);
