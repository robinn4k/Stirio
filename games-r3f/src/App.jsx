import { useState } from 'react';
import Menu from './Menu.jsx';
import NinjaShaker from './games/NinjaShaker/NinjaShaker.jsx';
import MixologyRush from './games/MixologyRush/MixologyRush.jsx';
import CocktailTinder from './games/CocktailTinder/CocktailTinder.jsx';

export default function App() {
  const [game, setGame] = useState(null);
  const goMenu = () => setGame(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {game === null && <Menu onPick={setGame} />}
      {game === 'ninja' && <NinjaShaker onExit={goMenu} />}
      {game === 'mixology' && <MixologyRush onExit={goMenu} />}
      {game === 'tinder' && <CocktailTinder onExit={goMenu} />}
      {game !== null && (
        <button
          onClick={goMenu}
          style={{
            position: 'absolute', top: 10, left: 10, zIndex: 30,
            padding: '6px 12px', borderRadius: 999,
            border: '1px solid #b0956e55', background: 'rgba(8,17,12,.6)',
            color: '#d4a44a', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
        >
          ← Menú
        </button>
      )}
    </div>
  );
}
