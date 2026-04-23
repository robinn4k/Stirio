// Stirio — ModeSheet (bottom sheet describing a play mode when user taps it
// from Home's mode-menu FAB).
// Depends on ui.jsx.
// Split from the former monolithic js/screens.jsx (PR #145).

const ModeSheet = ({ mode, onClose, onStart }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const modes = {
    daily: { icon: '📅', title: tr('mode.daily.title', 'Reto Diario'), subtitle: tr('mode.daily.sub', '10 preguntas nuevas cada día'), body: tr('mode.daily.body', 'Una ronda curada por nuestro barman-jefe. Se renueva a medianoche.'), cta: tr('mode.daily.cta', 'Empezar reto') },
    duel: { icon: '⚔️', title: tr('mode.duel.title', 'Duelo'), subtitle: tr('mode.duel.sub', 'Reta a amigos, rivales o a un bot'), body: tr('mode.duel.body', 'Crea una sala con código, únete a una existente o busca rival aleatorio.'), cta: tr('mode.duel.cta', 'Crear sala') },
    academy: { icon: '🎓', title: tr('mode.academy.title', 'Cocktail Academy'), subtitle: tr('mode.academy.sub', 'Familias de cócteles, paso a paso'), body: tr('mode.academy.body', 'Sours, Highballs, Martinis, Old-School, Tiki y Modernos — con teoría, práctica y quiz.'), cta: tr('mode.academy.cta', 'Abrir academia') },
    speed: { icon: '⚡', title: tr('mode.speed.title', 'Modo Velocidad'), subtitle: tr('mode.speed.sub', '60 segundos · cuantas más aciertes, más XP'), body: tr('mode.speed.body', 'Preguntas encadenadas hasta que el reloj llegue a cero.'), cta: tr('mode.speed.cta', 'Empezar') },
    builder: { icon: '🍹', title: tr('mode.builder.title', 'Constructor'), subtitle: tr('mode.builder.sub', 'Adivina el cóctel por sus ingredientes'), body: tr('mode.builder.body', 'Te damos la receta sin nombre. Tú nos dices qué es.'), cta: tr('mode.builder.cta', 'Jugar') },
    blind: { icon: '👃', title: tr('mode.blind.title', 'Cata a ciegas'), subtitle: tr('mode.blind.sub', '35+ destilados'), body: tr('mode.blind.body', 'Pistas de aroma y sabor. Identifica el destilado sin ver la etiqueta.'), cta: tr('mode.blind.cta', 'Jugar') },
    freequiz: { icon: '🎲', title: tr('mode.freequiz.title', 'Quiz Libre'), subtitle: tr('mode.freequiz.sub', '24 rondas temáticas'), body: tr('mode.freequiz.body', 'Elige la categoría, el largo y la dificultad. Sin presión.'), cta: tr('mode.freequiz.cta', 'Jugar') },
    arcade: { icon: '🕹️', title: tr('mode.arcade.title', 'Arcade Coctelero'), subtitle: tr('mode.arcade.sub', 'Aprende recetas jugando'), body: tr('mode.arcade.body', 'Mini-juegos con físicas: shake-o-meter, garnish catcher, pour target.'), cta: tr('mode.arcade.cta', 'Jugar') },
    memory: { icon: '🧠', title: tr('mode.memory.title', 'Memoria de Garnish'), subtitle: tr('mode.memory.sub', 'Empareja guarniciones'), body: tr('mode.memory.body', 'Memory clásico con ingredientes, vasos y herramientas.'), cta: tr('mode.memory.cta', 'Jugar') },
    rhythm: { icon: '🥁', title: tr('mode.rhythm.title', 'Ritmo de Shaker'), subtitle: tr('mode.rhythm.sub', 'Agita al compás'), body: tr('mode.rhythm.body', 'Sigue el ritmo. Cuanto mejor tu tempo, más perfecta la emulsión.'), cta: tr('mode.rhythm.cta', 'Jugar') },
    comanda: { icon: '🎟️', title: tr('mode.comanda.title', 'Comanda Chase'), subtitle: tr('mode.comanda.sub', 'Sirve cócteles contrarreloj'), body: tr('mode.comanda.body', 'Entran tickets, tú tienes la estación. Pone ingredientes, agita o remueve, guarnece y sirve. Landscape · 90 s.'), cta: tr('mode.comanda.cta', 'Jugar') },
    iba: { icon: '📖', title: tr('mode.iba.title', 'Recetas'), subtitle: tr('mode.iba.sub', '90 recetas oficiales'), body: tr('mode.iba.body', 'Las recetas reconocidas por la International Bartenders Association, con historia y técnica.'), cta: tr('mode.iba.cta', 'Abrir') },
    wiki: { icon: '📜', title: tr('mode.wiki.title', 'Enciclopedia · Historia'), subtitle: tr('mode.wiki.sub', 'Historia · Técnicas · Destilados · 3D'), body: tr('mode.wiki.body', 'Línea del tiempo, eras, personajes y bares legendarios. Además técnicas, destilados, herramientas y modelos 3D.'), cta: tr('mode.wiki.cta', 'Abrir') },
    glossary: { icon: '📝', title: tr('mode.glossary.title', 'Glosario'), subtitle: tr('mode.glossary.sub', '70+ términos'), body: tr('mode.glossary.body', 'Del muddle al dry shake. Todos los términos del oficio.'), cta: tr('mode.glossary.cta', 'Abrir') },
    map: { icon: '🗺️', title: tr('mode.map.title', 'Mapa de Destilados'), subtitle: tr('mode.map.sub', '12 regiones'), body: tr('mode.map.body', 'Whisky escocés, mezcal oaxaqueño, pisco peruano… mapa interactivo.'), cta: tr('mode.map.cta', 'Explorar') },
    library: { icon: '📚', title: tr('mode.library.title', 'Biblioteca 3D'), subtitle: tr('mode.library.sub', 'Modelos interactivos'), body: tr('mode.library.body', 'Vasos, herramientas y botellas en 3D. Gíralos, inspecciónalos.'), cta: tr('mode.library.cta', 'Abrir') },
  };
  const m = modes[mode];
  if (!m) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 20,
      animation: 'fadeIn .25s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        maxWidth: 460, width: '100%',
        padding: 28,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
        borderColor: 'oklch(0.82 0.17 75 / 0.3)',
        animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, padding: 6, color: 'var(--ink-3)' }}>
          <Icon name="close" size={18} />
        </button>
        <div style={{ fontSize: 64, marginBottom: 10, filter: 'drop-shadow(0 6px 20px var(--amber-glow))' }}>{m.icon}</div>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 4 }}>{m.subtitle}</div>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: '0 0 10px', lineHeight: 1.05 }}>{m.title}</h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 20 }}>{m.body}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={onClose}>{tr('mode.close', 'Cerrar')}</button>
          <button className="btn primary" onClick={onStart} style={{ flex: 1 }}>
            <Icon name="play" size={14} /> {m.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ModeSheet });
