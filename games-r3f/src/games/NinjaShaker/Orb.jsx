import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Trail } from '@react-three/drei';
import { getIngredientEmoji } from '../../data/cocktails.js';

const RADIUS = 0.65; // previously 0.45 — larger so orbs feel present

/**
 * One ingredient orb. Physics state lives on a shared ref (parent Orbs
 * owns the tick); this component renders the 3D mesh and handles the
 * pointer slice.
 */
export default function Orb({ orb, registerState, onSlice }) {
  const group = useRef();
  const core = useRef();
  const halo = useRef();
  const spawnTime = useRef(performance.now());

  const state = useMemo(() => ({
    position: [...orb.position],
    velocity: [...orb.velocity],
    rotation: 0,
  }), [orb.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    registerState(state);
  }, [state, registerState]);

  useFrame((s) => {
    if (!group.current) return;
    group.current.position.set(state.position[0], state.position[1], state.position[2]);
    group.current.rotation.z = state.rotation;

    // Spawn pulse — quick scale from 0.4 → 1 in 220 ms.
    const age = (performance.now() - spawnTime.current) / 1000;
    const pulse = age < 0.25 ? 0.4 + (age / 0.25) * 0.6 : 1;
    if (core.current) core.current.scale.setScalar(pulse);

    // Halo breathing.
    if (halo.current) {
      const t = s.clock.elapsedTime;
      const breath = 1 + Math.sin(t * 3 + spawnTime.current) * 0.08;
      halo.current.scale.setScalar(breath);
    }
  });

  const bodyColor = orb.correct ? '#34d399' : '#475569';
  const glowColor = orb.correct ? '#6ee7b7' : '#94a3b8';
  const trailColor = orb.correct ? '#34d399' : '#f87171';
  const emoji = getIngredientEmoji(orb.ingredient);

  const handleSlice = (e) => {
    e.stopPropagation();
    onSlice(state.position[0], state.position[1]);
  };

  return (
    <group ref={group} onPointerDown={handleSlice}>
      <Trail
        width={0.35}
        length={7}
        color={trailColor}
        attenuation={(t) => t * t}
      >
        <group ref={core}>
          {/* Outer soft halo */}
          <mesh ref={halo} position={[0, 0, -0.05]}>
            <sphereGeometry args={[RADIUS * 1.55, 24, 24]} />
            <meshBasicMaterial color={glowColor} transparent opacity={orb.correct ? 0.22 : 0.08} />
          </mesh>
          {/* Mid glow */}
          <mesh>
            <sphereGeometry args={[RADIUS * 1.15, 24, 24]} />
            <meshBasicMaterial color={glowColor} transparent opacity={orb.correct ? 0.18 : 0.06} />
          </mesh>
          {/* Core sphere */}
          <mesh>
            <sphereGeometry args={[RADIUS, 32, 32]} />
            <meshStandardMaterial
              color={bodyColor}
              emissive={bodyColor}
              emissiveIntensity={orb.correct ? 0.8 : 0.15}
              roughness={0.22}
              metalness={0.2}
            />
          </mesh>
          {/* Glass highlight */}
          <mesh position={[-0.18, 0.2, 0.52]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
          </mesh>
        </group>
      </Trail>
      {/* Emoji + label rendered via Html so it always faces the camera */}
      <Html center distanceFactor={8} zIndexRange={[0, 10]} style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none',
        }}>
          <div style={{
            fontSize: 36, lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.55))',
          }}>{emoji}</div>
          <div style={{
            fontSize: 10, color: '#f0f5f1', marginTop: 6, whiteSpace: 'nowrap', fontWeight: 700,
            background: 'rgba(8,17,12,.75)', padding: '3px 8px', borderRadius: 10,
            border: `1px solid ${orb.correct ? 'rgba(52,211,153,.6)' : 'rgba(107,114,128,.45)'}`,
            boxShadow: orb.correct ? '0 0 12px rgba(52,211,153,.25)' : 'none',
            letterSpacing: 0.2,
          }}>
            {orb.ingredient}
          </div>
        </div>
      </Html>
    </group>
  );
}
