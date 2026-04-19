// Stirio — MapScreen: spirit production regions grid (ES)
// Data inlined (condensed from wiki-map.js SPIRIT_REGIONS to avoid coupling
// to that ES module, which only loads inside wiki.html iframe).

const SPIRIT_FAMILIES = [
  { key: 'all',     label: 'Todo',    icon: '✦' },
  { key: 'whisky',  label: 'Whisky',  icon: '🥃' },
  { key: 'gin',     label: 'Gin',     icon: '🌿' },
  { key: 'tequila', label: 'Tequila', icon: '🌵' },
  { key: 'rum',     label: 'Ron',     icon: '🏝️' },
  { key: 'vodka',   label: 'Vodka',   icon: '❄️' },
  { key: 'brandy',  label: 'Brandy',  icon: '🍇' },
  { key: 'other',   label: 'Otros',   icon: '🍶' },
];

const MAP_REGIONS = [
  // Whisky
  { id: 'scotch',          spirit: 'whisky',  icon: '🏴', origin: 'Escocia',        place: 'Highlands / Speyside / Islay', year: '1494' },
  { id: 'irish-whiskey',   spirit: 'whisky',  icon: '☘️', origin: 'Irlanda',         place: 'Dublín / Cork',              year: 's. XV' },
  { id: 'bourbon',         spirit: 'whisky',  icon: '🥃', origin: 'EE. UU.',         place: 'Kentucky',                    year: 's. XVIII' },
  { id: 'japanese-whisky', spirit: 'whisky',  icon: '🇯🇵', origin: 'Japón',           place: 'Yamazaki / Yoichi',           year: '1923' },
  // Gin
  { id: 'london-gin',      spirit: 'gin',     icon: '🌿', origin: 'Inglaterra',      place: 'Londres',                     year: 's. XVII' },
  { id: 'genever',         spirit: 'gin',     icon: '🇳🇱', origin: 'Países Bajos',   place: 'Ámsterdam / Schiedam',        year: 's. XVII' },
  // Tequila & Mezcal
  { id: 'tequila',         spirit: 'tequila', icon: '🌵', origin: 'México',          place: 'Tequila, Jalisco',            year: 's. XVI' },
  { id: 'mezcal',          spirit: 'tequila', icon: '🔥', origin: 'México',          place: 'Oaxaca',                      year: 's. XVI' },
  // Ron / Rum
  { id: 'ron-cuba',        spirit: 'rum',     icon: '🇨🇺', origin: 'Cuba',            place: 'La Habana / Santiago',        year: 's. XVII' },
  { id: 'ron-jamaica',     spirit: 'rum',     icon: '🏝️', origin: 'Jamaica',         place: 'Kingston',                    year: '1650s' },
  { id: 'ron-puerto-rico', spirit: 'rum',     icon: '🇵🇷', origin: 'Puerto Rico',     place: 'San Juan',                    year: 's. XVII' },
  { id: 'ron-barbados',    spirit: 'rum',     icon: '🇧🇧', origin: 'Barbados',        place: 'Bridgetown',                  year: '1640s' },
  { id: 'rhum-agricole',   spirit: 'rum',     icon: '🍬', origin: 'Martinica',       place: 'Fort-de-France',              year: 's. XVII' },
  // Vodka
  { id: 'vodka-poland',    spirit: 'vodka',   icon: '🇵🇱', origin: 'Polonia',         place: 'Varsovia / Poznań',           year: 's. VIII-IX' },
  { id: 'vodka-russia',    spirit: 'vodka',   icon: '❄️', origin: 'Rusia',           place: 'Moscú',                       year: 's. VIII-IX' },
  { id: 'vodka-sweden',    spirit: 'vodka',   icon: '🇸🇪', origin: 'Suecia',          place: 'Estocolmo / Åhus',            year: 's. XV' },
  // Brandy / Cognac
  { id: 'cognac',          spirit: 'brandy',  icon: '🍇', origin: 'Francia',         place: 'Cognac',                      year: 's. XVI' },
  { id: 'armagnac',        spirit: 'brandy',  icon: '🏰', origin: 'Francia',         place: 'Gascuña',                     year: 's. XIV' },
  { id: 'brandy-jerez',    spirit: 'brandy',  icon: '🇪🇸', origin: 'España',          place: 'Jerez de la Frontera',        year: 's. XVI' },
  { id: 'calvados',        spirit: 'brandy',  icon: '🍎', origin: 'Francia',         place: 'Normandía',                   year: 's. XVI' },
  { id: 'grappa',          spirit: 'brandy',  icon: '🇮🇹', origin: 'Italia',          place: 'Véneto / Trentino',           year: 's. XIV' },
  // Others
  { id: 'pisco-peru',      spirit: 'other',   icon: '🇵🇪', origin: 'Perú',            place: 'Ica / Pisco',                 year: 's. XVI' },
  { id: 'pisco-chile',     spirit: 'other',   icon: '🇨🇱', origin: 'Chile',           place: 'Valle del Elqui',             year: 's. XVI' },
  { id: 'cachaca',         spirit: 'other',   icon: '🇧🇷', origin: 'Brasil',          place: 'Minas Gerais',                year: '1530s' },
  { id: 'sake',            spirit: 'other',   icon: '🍶', origin: 'Japón',           place: 'Fushimi, Kioto',              year: '~700 d.C.' },
  { id: 'soju',            spirit: 'other',   icon: '🇰🇷', origin: 'Corea del Sur',   place: 'Seúl',                        year: 's. XIII' },
  { id: 'baijiu',          spirit: 'other',   icon: '🇨🇳', origin: 'China',           place: 'Sichuan / Guizhou',           year: '~800 d.C.' },
  { id: 'aquavit',         spirit: 'other',   icon: '🇳🇴', origin: 'Noruega',         place: 'Oslo',                        year: 's. XV' },
  { id: 'orujo',           spirit: 'other',   icon: '⚗️', origin: 'España',          place: 'Galicia',                     year: 's. XVI' },
];

const MapScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [family, setFamily] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = family === 'all'
    ? MAP_REGIONS
    : MAP_REGIONS.filter(r => r.spirit === family);

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('map.eyebrow', 'referencia')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('map.header', 'Mapa de destilados')}</h1>
        </div>
      </div>

      <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 14 }}>
        {tr('map.intro', 'Las regiones donde nacieron los destilados más emblemáticos del mundo.')}
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {SPIRIT_FAMILIES.map(f => (
          <button key={f.key} onClick={() => setFamily(f.key)} className="chip" style={{
            padding: '6px 12px', borderRadius: 99, fontSize: 12,
            background: family === f.key ? 'var(--amber)' : 'var(--bg-2)',
            color: family === f.key ? 'var(--bg-0)' : 'var(--ink-2)',
            border: '1px solid ' + (family === f.key ? 'var(--amber)' : 'var(--line)'),
            cursor: 'pointer',
          }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {filtered.map(r => (
          <button key={r.id} onClick={() => setSelected(r)} className="card" style={{
            padding: 14, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--line)',
            background: 'var(--bg-2)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{r.icon}</div>
            <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.2, marginBottom: 2 }}>{r.origin}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.year}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', padding: 20, animation: 'fadeIn .25s ease',
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{
            maxWidth: 420, width: '100%', padding: 24,
            background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
            borderColor: 'oklch(0.82 0.17 75 / 0.3)',
            animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)', position: 'relative',
          }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, padding: 6, color: 'var(--ink-3)' }}>
              <Icon name="close" size={18} />
            </button>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{selected.icon}</div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 26, margin: '0 0 4px' }}>{selected.origin}</h2>
            <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 14 }}>
              {SPIRIT_FAMILIES.find(f => f.key === selected.spirit)?.label || selected.spirit}
            </div>
            <div style={{ marginBottom: 8, color: 'var(--ink-2)', fontSize: 14 }}>
              <strong style={{ color: 'var(--ink-1)' }}>{tr('map.field_place', 'Zona')}:</strong> {selected.place}
            </div>
            <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>
              <strong style={{ color: 'var(--ink-1)' }}>{tr('map.field_year', 'Origen')}:</strong> {selected.year}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { MapScreen, MAP_REGIONS });
