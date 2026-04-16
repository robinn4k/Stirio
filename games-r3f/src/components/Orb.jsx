import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { getIngredientEmoji } from '../data/cocktails.js';

/**
 * One ingredient orb. We keep per-frame physics state on a ref managed by
 * the parent (`Orbs`), while the mesh transform tracks that state in the
 * render loop. Click/tap triggers a slice callback — the parent translates
 * that into a store update.
 */
export default function Orb({ orb, registerState, onSlice }) {
  const group = useRef();

  // Initialise the shared mutable state for this orb.
  const state = useMemo(() => ({
    position: [...orb.position],
    velocity: [...orb.velocity],
    rotation: 0,
  }), [orb.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    registerState(state);
  }, [state, registerState]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.set(state.position[0], state.position[1], state.position[2]);
    group.current.rotation.z = state.rotation;
  });

  const color = orb.correct ? '#34d399' : '#6b7280';
  const emoji = getIngredientEmoji(orb.ingredient);

  const handleSlice = (e) => {
    e.stopPropagation();
    onSlice(state.position[0], state.position[1]);
  };

  return (
    <group ref={group} onPointerDown={handleSlice}>
      <Trail
        width={0.25}
        length={6}
        color={orb.correct ? '#34d399' : '#f87171'}
        attenuation={(t) => t * t}
      >
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={orb.correct ? 0.6 : 0.15}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
      </Trail>
      {/* Glass highlight */}
      <mesh position={[-0.12, 0.14, 0.42]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {/* Emoji + label rendered via Html so it always faces the camera */}
      <Html center distanceFactor={8} zIndexRange={[0, 10]} style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none',
          transform: 'translateY(-4px)',
        }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</div>
          <div style={{
            fontSize: 9, color: '#cfd8dc', marginTop: 4, whiteSpace: 'nowrap',
            background: 'rgba(10,15,12,.6)', padding: '2px 6px', borderRadius: 8,
            border: `1px solid ${orb.correct ? 'rgba(52,211,153,.5)' : 'rgba(107,114,128,.4)'}`,
          }}>
            {orb.ingredient}
          </div>
        </div>
      </Html>
    </group>
  );
}
