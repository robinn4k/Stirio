import { useEffect, useState } from 'react';
import { useMixologyRush } from './useMixologyRush.js';

const panelStyle = {
  position: 'absolute', pointerEvents: 'none',
  color: '#f0e6d3', fontWeight: 700, fontFamily: 'system-ui, sans-serif',
  textShadow: '0 2px 8px rgba(0,0,0,.55)',
};

export default function MixologyRushHUD() {
  const cocktail = useMixologyRush(s => s.cocktail);
  const score = useMixologyRush(s => s.score);
  const round = useMixologyRush(s => s.round);
  const totalRounds = useMixologyRush(s => s.totalRounds);
  const combo = useMixologyRush(s => s.combo);
  const timeLeft = useMixologyRush(s => s.timeLeft);
  const maxTime = useMixologyRush(s => s.maxTime);
  const correctThisRound = useMixologyRush(s => s.correctThisRound);
  const correctNeeded = useMixologyRush(s => s.correctNeeded);
  const flair = useMixologyRush(s => s.flair);

  const [flairVisible, setFlairVisible] = useState(false);
  useEffect(() => {
    if (!flair) { setFlairVisible(false); return; }
    setFlairVisible(true);
    const remaining = Math.max(0, flair.ttl - performance.now());
    const id = setTimeout(() => setFlairVisible(false), remaining);
    return () => clearTimeout(id);
  }, [flair]);

  const timePct = Math.max(0, Math.min(1, timeLeft / maxTime));
  const urgent = timeLeft <= 10;

  return (
    <>
      {/* Top-center round pill */}
      <div style={{
        ...panelStyle,
        top: 12, left: 0, right: 0, textAlign: 'center',
      }}>
        <span style={{
          fontSize: 11, color: '#cfd8dc',
          background: 'rgba(255,255,255,.08)', padding: '3px 10px', borderRadius: 10,
        }}>
          Ronda {round + 1}/{totalRounds}
        </span>
      </div>

      {/* Cocktail name */}
      <div style={{
        ...panelStyle,
        top: 36, left: 0, right: 0, textAlign: 'center',
        fontSize: 20, color: '#d4a44a',
      }}>
        {cocktail?.icon} {cocktail?.name}
      </div>

      {/* Score top-right */}
      <div style={{ ...panelStyle, top: 36, right: 16, fontSize: 14 }}>
        {score} pts
      </div>

      {/* Combo */}
      {combo >= 2 && (
        <div style={{
          ...panelStyle,
          top: 64, left: 0, right: 0, textAlign: 'center', fontSize: 15,
          color: combo >= 4 ? '#ff6b35' : '#d4a44a',
        }}>
          {combo >= 4 ? '🔥' : ''} Combo ×{combo}
        </div>
      )}

      {/* Flair popup */}
      {flairVisible && flair && (
        <div style={{
          ...panelStyle,
          top: '48%', left: 0, right: 0, textAlign: 'center',
          fontSize: 24, color: flair.color,
          animation: 'mrFlair 800ms ease-out forwards',
        }}>
          {flair.text}
        </div>
      )}

      {/* Timer bar */}
      <div style={{
        position: 'absolute', top: 88, left: 16, right: 16, height: 6,
        background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${timePct * 100}%`, height: '100%',
          background: urgent
            ? 'linear-gradient(90deg, #e74c3c, #ff6b35)'
            : 'linear-gradient(90deg, #a78bfa, #d4a44a)',
          transition: 'width 500ms linear',
        }} />
      </div>

      {/* Round progress */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
        color: '#cfd8dc', fontSize: 11, fontFamily: 'system-ui, sans-serif',
      }}>
        {correctThisRound}/{correctNeeded} ingredientes
      </div>

      <style>{`@keyframes mrFlair {
        0%   { transform: scale(0.7); opacity: 0; }
        25%  { transform: scale(1.15); opacity: 1; }
        75%  { transform: scale(1);    opacity: 1; }
        100% { transform: scale(1.1);  opacity: 0; }
      }`}</style>
    </>
  );
}
