import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame.js';

const panelStyle = {
  position: 'absolute', pointerEvents: 'none',
  color: '#f0e6d3', fontWeight: 700, fontFamily: 'system-ui, sans-serif',
  textShadow: '0 2px 8px rgba(0,0,0,.55)',
};

export default function HUD() {
  const cocktail = useGame(s => s.cocktail);
  const score = useGame(s => s.score);
  const lives = useGame(s => s.lives);
  const combo = useGame(s => s.combo);
  const totalSpawned = useGame(s => s.totalSpawned);
  const maxSpawn = useGame(s => s.maxSpawn);
  const flair = useGame(s => s.flair);

  const [flairVisible, setFlairVisible] = useState(false);
  useEffect(() => {
    if (!flair) { setFlairVisible(false); return; }
    setFlairVisible(true);
    const remaining = Math.max(0, flair.ttl - performance.now());
    const id = setTimeout(() => setFlairVisible(false), remaining);
    return () => clearTimeout(id);
  }, [flair]);

  const progress = Math.min(1, totalSpawned / maxSpawn);

  return (
    <>
      {/* Top bar — cocktail target */}
      <div style={{ ...panelStyle, top: 12, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: '#d4a44a' }}>
        {cocktail?.icon} {cocktail?.name}
      </div>

      {/* Score */}
      <div style={{ ...panelStyle, top: 40, left: 16, fontSize: 14 }}>
        {score} pts
      </div>

      {/* Lives */}
      <div style={{ ...panelStyle, top: 40, right: 16, fontSize: 16 }}>
        {'❤️'.repeat(lives) || '—'}
      </div>

      {/* Combo chip */}
      {combo > 1 && (
        <div style={{
          ...panelStyle,
          top: 66, left: 0, right: 0, textAlign: 'center', fontSize: 15, color: '#d4a44a',
        }}>
          ×{combo} combo
        </div>
      )}

      {/* Flair (score popup) */}
      {flairVisible && flair && (
        <div style={{
          ...panelStyle,
          top: '48%', left: 0, right: 0, textAlign: 'center',
          fontSize: 26, color: flair.color,
          animation: 'flairPop 650ms ease-out forwards',
        }}>
          {flair.text}
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 14, left: 16, right: 16, height: 4,
        background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #34d399, #d4a44a)',
          transition: 'width 180ms ease-out',
        }} />
      </div>

      <style>{`@keyframes flairPop {
        0%   { transform: scale(0.7); opacity: 0; }
        30%  { transform: scale(1.15); opacity: 1; }
        70%  { transform: scale(1);    opacity: 1; }
        100% { transform: scale(1.1);  opacity: 0; }
      }`}</style>
    </>
  );
}
