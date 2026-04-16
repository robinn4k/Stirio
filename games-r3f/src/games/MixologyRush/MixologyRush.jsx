import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { useMixologyRush } from './useMixologyRush.js';
import Shaker from './Shaker.jsx';
import Card from './Card.jsx';
import MixologyRushHUD from './MixologyRushHUD.jsx';
import ResultScreen from '../../components/ResultScreen.jsx';
import BokehBackground from '../../components/BokehBackground.jsx';

// Layout: cards placed in a 2-col grid in the upper half of the world so
// they never overlap the central shaker. Camera is at z=11 → visible world
// width ≈ 10, height ≈ 13.
const SHAKER_POS = [0, -2.6, 0];
const SHAKER_RADIUS = 0.9;

function cardPositions(n) {
  const cols = 2;
  const colGap = 2.4;   // horizontal distance between card centers
  const rowGap = 0.85;  // vertical distance
  const startY = 3.2;   // top-most row
  const positions = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - 0.5) * colGap;
    const y = startY - row * rowGap;
    positions.push([x, y, 0]);
  }
  return positions;
}

export default function MixologyRush({ onExit }) {
  const status = useMixologyRush(s => s.status);
  const start = useMixologyRush(s => s.start);
  const tick = useMixologyRush(s => s.tick);
  const cards = useMixologyRush(s => s.cards);
  const dropOnShaker = useMixologyRush(s => s.dropOnShaker);
  const score = useMixologyRush(s => s.score);
  const correctTotal = useMixologyRush(s => s.correctTotal);
  const bestCombo = useMixologyRush(s => s.bestCombo);
  const round = useMixologyRush(s => s.round);

  useEffect(() => { if (status === 'idle') start(); }, [status, start]);

  // Timer tick.
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, tick]);

  const layout = useMemo(() => cardPositions(cards.length), [cards.length]);

  const handleDrop = (id, worldPos) => {
    const dx = worldPos[0] - SHAKER_POS[0];
    const dy = worldPos[1] - SHAKER_POS[1];
    if (Math.hypot(dx, dy) < SHAKER_RADIUS + 0.4) {
      dropOnShaker(id);
    }
    // else: card will bounce back via its own animation
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#160821']} />
        <fog attach="fog" args={['#160821', 12, 28]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 6, 6]} intensity={1.1} />
        <pointLight position={[-4, 2, 4]} intensity={0.7} color="#a78bfa" />
        <pointLight position={[4, -2, 4]} intensity={0.5} color="#d4a44a" />

        <Stars radius={28} depth={30} count={500} factor={2.2} fade speed={0.3} />
        <BokehBackground colors={['#a78bfa', '#6b4fa2', '#d4a44a']} count={14} depth={7} />

        <Shaker position={SHAKER_POS} radius={SHAKER_RADIUS} />

        {(status === 'playing' || status === 'between') &&
          cards.map((c, i) => (
            <Card
              key={c.id}
              card={c}
              homePosition={layout[i] ?? [0, 2, 0]}
              onDrop={handleDrop}
            />
          ))}

        <Environment preset="sunset" background={false} />

        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.3} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>

      {(status === 'playing' || status === 'between') && <MixologyRushHUD />}
      {(status === 'win' || status === 'over') && (
        <ResultScreen
          title={status === 'win' ? '¡Maestro mixologist!' : '¡Tiempo agotado!'}
          titleColor={status === 'win' ? '#a78bfa' : '#e74c3c'}
          stats={[
            { label: 'Puntos', value: score },
            { label: 'Aciertos', value: correctTotal },
            { label: 'Mejor combo', value: `×${bestCombo}` },
            { label: 'Ronda', value: `${round + 1}/5` },
          ]}
          onRetry={start}
          onMenu={onExit}
        />
      )}
    </>
  );
}
