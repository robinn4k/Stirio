import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useGame } from './hooks/useGame.js';
import Orbs from './components/Orbs.jsx';
import SliceEffects from './components/SliceEffects.jsx';
import HUD from './components/HUD.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';

export default function NinjaShaker() {
  const status = useGame(s => s.status);
  const start = useGame(s => s.start);
  const spawn = useGame(s => s.spawn);
  const totalSpawned = useGame(s => s.totalSpawned);
  const maxSpawn = useGame(s => s.maxSpawn);
  const [slices, setSlices] = useState([]);

  // Spawn cadence — mirrors the original Phaser difficulty curve.
  useEffect(() => {
    if (status !== 'playing') return;
    let timer;
    const schedule = () => {
      const spawned = useGame.getState().totalSpawned;
      if (useGame.getState().status !== 'playing') return;
      if (spawned >= maxSpawn) return;
      const delay = spawned < 8 ? 1100 : spawned < 15 ? 900 : spawned < 25 ? 720 : 580;
      timer = setTimeout(() => {
        spawn();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [status, spawn, maxSpawn]);

  const onSlice = (x, y, color) => {
    const id = `sfx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setSlices(prev => [...prev, { id, position: [x, y, 0], color }]);
    // Auto-remove slice effect after its lifetime.
    setTimeout(() => setSlices(prev => prev.filter(s => s.id !== id)), 700);
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#08110c']} />
        <fog attach="fog" args={['#08110c', 10, 25]} />

        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
        <pointLight position={[-4, -2, 4]} intensity={0.6} color="#34d399" />
        <pointLight position={[4, -2, 4]} intensity={0.4} color="#d4a44a" />

        <Stars radius={30} depth={30} count={600} factor={2.5} fade speed={0.4} />

        {status === 'playing' && <Orbs onSlice={onSlice} />}
        <SliceEffects slices={slices} />

        <Environment preset="night" background={false} />

        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.25} luminanceSmoothing={0.18} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.75} />
        </EffectComposer>
      </Canvas>

      {status === 'idle' && <TitleScreen onStart={start} />}
      {status === 'playing' && <HUD />}
      {(status === 'win' || status === 'over') && <ResultScreen />}
    </>
  );
}
