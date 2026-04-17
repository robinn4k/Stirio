import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useNinjaShaker } from './useNinjaShaker.js';
import Orbs from './Orbs.jsx';
import SliceEffects from './SliceEffects.jsx';
import NinjaShakerHUD from './NinjaShakerHUD.jsx';
import ResultScreen from '../../components/ResultScreen.jsx';
import BokehBackground from '../../components/BokehBackground.jsx';
import useReducedGraphics from '../../hooks/useReducedGraphics.js';

export default function NinjaShaker({ onExit }) {
  const status = useNinjaShaker(s => s.status);
  const start = useNinjaShaker(s => s.start);
  const spawn = useNinjaShaker(s => s.spawn);
  const maxSpawn = useNinjaShaker(s => s.maxSpawn);
  const score = useNinjaShaker(s => s.score);
  const correct = useNinjaShaker(s => s.correct);
  const bestCombo = useNinjaShaker(s => s.bestCombo);
  const [slices, setSlices] = useState([]);
  const reduced = useReducedGraphics();

  // Auto-start the moment this game mounts.
  useEffect(() => { if (status === 'idle') start(); }, [status, start]);

  // Spawn cadence — adaptive to device. Mobile / reduced gets a much
  // calmer curve so taps can actually land on each orb.
  useEffect(() => {
    if (status !== 'playing') return;
    let timer;
    const schedule = () => {
      const spawned = useNinjaShaker.getState().totalSpawned;
      if (useNinjaShaker.getState().status !== 'playing') return;
      if (spawned >= maxSpawn) return;
      const delay = reduced
        ? (spawned < 8 ? 1600 : spawned < 15 ? 1350 : spawned < 25 ? 1100 : 900)
        : (spawned < 8 ? 1200 : spawned < 15 ? 1000 : spawned < 25 ? 820 : 680);
      timer = setTimeout(() => {
        spawn();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [status, spawn, maxSpawn, reduced]);

  const onSlice = (x, y, color) => {
    const id = `sfx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setSlices(prev => [...prev, { id, position: [x, y, 0], color }]);
    setTimeout(() => setSlices(prev => prev.filter(s => s.id !== id)), 700);
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={reduced ? 1 : [1, 2]}
        gl={{ antialias: !reduced, alpha: false, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <color attach="background" args={['#0f0a1a']} />
        <fog attach="fog" args={['#0f0a1a', 10, 25]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, 4]} intensity={0.6} color="#34d399" />
        <pointLight position={[4, -2, 4]} intensity={0.4} color="#d4a44a" />

        <Stars radius={30} depth={30} count={reduced ? 300 : 600} factor={2.5} fade speed={0.3} />
        {!reduced && <BokehBackground colors={['#d4a44a']} count={8} depth={7} />}

        {status === 'playing' && <Orbs onSlice={onSlice} />}
        <SliceEffects slices={slices} />

        {!reduced && <Environment preset="night" background={false} />}

        {!reduced && (
          <EffectComposer>
            <Bloom intensity={0.55} luminanceThreshold={0.3} luminanceSmoothing={0.18} mipmapBlur />
            <Vignette eskil={false} offset={0.18} darkness={0.72} />
          </EffectComposer>
        )}
      </Canvas>

      {status === 'playing' && <NinjaShakerHUD />}
      {(status === 'win' || status === 'over') && (
        <ResultScreen
          title={status === 'win' ? '¡Perfecto shaker!' : '¡Sin vidas!'}
          titleColor={status === 'win' ? '#34d399' : '#e74c3c'}
          stats={[
            { label: 'Puntos', value: score },
            { label: 'Aciertos', value: correct },
            { label: 'Mejor combo', value: `×${bestCombo}` },
          ]}
          onRetry={start}
          onMenu={onExit}
        />
      )}
    </>
  );
}
