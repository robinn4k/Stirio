import { useEffect, useState } from 'react';
import { useCocktailTinder } from './useCocktailTinder.js';

const panelStyle = {
  position: 'absolute', pointerEvents: 'none',
  color: '#f0e6d3', fontWeight: 700, fontFamily: 'system-ui, sans-serif',
  textShadow: '0 2px 8px rgba(0,0,0,.55)',
};

export default function CocktailTinderHUD() {
  const cocktail = useCocktailTinder(s => s.cocktail);
  const score = useCocktailTinder(s => s.score);
  const index = useCocktailTinder(s => s.index);
  const total = useCocktailTinder(s => s.deck.length);
  const streak = useCocktailTinder(s => s.streak);
  const flair = useCocktailTinder(s => s.flair);

  const [flairVisible, setFlairVisible] = useState(false);
  useEffect(() => {
    if (!flair) { setFlairVisible(false); return; }
    setFlairVisible(true);
    const remaining = Math.max(0, flair.ttl - performance.now());
    const id = setTimeout(() => setFlairVisible(false), remaining);
    return () => clearTimeout(id);
  }, [flair]);

  const progress = total > 0 ? index / total : 0;

  return (
    <>
      {/* Cocktail target at the top */}
      <div style={{
        ...panelStyle, top: 14, left: 0, right: 0, textAlign: 'center',
        fontSize: 20, color: '#d4a44a',
      }}>
        {cocktail?.icon} {cocktail?.name}
      </div>
      <div style={{
        ...panelStyle, top: 42, left: 0, right: 0, textAlign: 'center',
        fontSize: 11, color: '#b0956e', fontWeight: 500,
      }}>
        ¿El ingrediente pertenece al cóctel? Swipe →
      </div>

      {/* Score */}
      <div style={{ ...panelStyle, top: 42, right: 16, fontSize: 14 }}>
        {score} pts
      </div>

      {/* Streak */}
      {streak >= 3 && (
        <div style={{
          ...panelStyle,
          top: 66, left: 0, right: 0, textAlign: 'center',
          fontSize: 15, color: streak >= 5 ? '#ff6b35' : '#d4a44a',
        }}>
          🔥 Racha ×{streak}
        </div>
      )}

      {/* Flair popup */}
      {flairVisible && flair && (
        <div style={{
          ...panelStyle,
          top: '18%', left: 0, right: 0, textAlign: 'center',
          fontSize: 22, color: flair.color,
          animation: 'ctFlair 650ms ease-out forwards',
        }}>
          {flair.text}
        </div>
      )}

      {/* Bottom hints */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex',
        justifyContent: 'space-between', padding: '0 24px', pointerEvents: 'none',
      }}>
        <div style={{ color: '#f87171', fontFamily: 'system-ui, sans-serif', fontSize: 12, letterSpacing: 1 }}>← NO</div>
        <div style={{ color: '#34d399', fontFamily: 'system-ui, sans-serif', fontSize: 12, letterSpacing: 1 }}>SÍ →</div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16, height: 5,
        background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #f87171, #fbbf24)',
          transition: 'width 200ms ease-out',
        }} />
      </div>
      <div style={{
        position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center',
        color: '#b0956e', fontSize: 11, fontFamily: 'system-ui, sans-serif',
      }}>
        {index}/{total}
      </div>

      <style>{`@keyframes ctFlair {
        0%   { transform: scale(0.8); opacity: 0; }
        25%  { transform: scale(1.1); opacity: 1; }
        75%  { transform: scale(1);   opacity: 1; }
        100% { transform: scale(1.1); opacity: 0; }
      }`}</style>
    </>
  );
}
