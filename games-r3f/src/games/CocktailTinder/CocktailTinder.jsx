import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useCocktailTinder } from './useCocktailTinder.js';
import SwipeCard from './SwipeCard.jsx';
import CocktailTinderHUD from './CocktailTinderHUD.jsx';
import ResultScreen from '../../components/ResultScreen.jsx';
import BokehBackground from '../../components/BokehBackground.jsx';

export default function CocktailTinder({ onExit }) {
  const status = useCocktailTinder(s => s.status);
  const start = useCocktailTinder(s => s.start);
  const deck = useCocktailTinder(s => s.deck);
  const index = useCocktailTinder(s => s.index);
  const decide = useCocktailTinder(s => s.decide);
  const score = useCocktailTinder(s => s.score);
  const correct = useCocktailTinder(s => s.correct);
  const bestStreak = useCocktailTinder(s => s.bestStreak);
  const total = deck.length;

  useEffect(() => { if (status === 'idle') start(); }, [status, start]);

  const current = deck[index];
  const next = deck[index + 1];

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1a0810']} />
        <fog attach="fog" args={['#1a0810', 10, 25]} />

        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 5, 6]} intensity={1.1} />
        <pointLight position={[-4, 2, 4]} intensity={0.5} color="#f87171" />
        <pointLight position={[4, -2, 4]} intensity={0.4} color="#fbbf24" />

        <Stars radius={24} depth={25} count={400} factor={1.8} fade speed={0.35} />
        <BokehBackground colors={['#f87171', '#fbbf24', '#a78bfa']} count={12} depth={6} />

        {/* Show up to 2 cards stacked so the next one is visible behind. */}
        {next && <SwipeCard key={`${next.id}-bg`} card={next} depth={1} interactive={false} />}
        {current && (
          <SwipeCard
            key={current.id}
            card={current}
            depth={0}
            onSwipe={decide}
          />
        )}

        <Environment preset="sunset" background={false} />

        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.3} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.75} />
        </EffectComposer>
      </Canvas>

      {status === 'playing' && <CocktailTinderHUD />}
      {status === 'done' && (
        <ResultScreen
          title={correct >= total * 0.8 ? '¡Maestro Tinder!' : '¡Partida terminada!'}
          titleColor={correct >= total * 0.8 ? '#34d399' : '#f87171'}
          stats={[
            { label: 'Puntos', value: score },
            { label: 'Aciertos', value: `${correct}/${total}` },
            { label: 'Mejor racha', value: `×${bestStreak}` },
          ]}
          onRetry={start}
          onMenu={onExit}
        />
      )}
    </>
  );
}
