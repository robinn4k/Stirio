import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameText from '../../components/GameText.jsx';
import { getIngredientEmoji } from '../../data/cocktails.js';

const RADIUS = 0.82;

/**
 * One ingredient orb. Physics state lives on a shared ref (parent Orbs
 * owns the tick); this component renders the 3D mesh and handles the
 * pointer slice.
 *
 * Labels use drei <GameText> (SDF rendered on the GPU) instead of <Html> to
 * avoid DOM portals per orb — that was the main cause of laggy controls
 * on mobile and pointer events being swallowed by layout thrash.
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

    const age = (performance.now() - spawnTime.current) / 1000;
    const pulse = age < 0.22 ? 0.4 + (age / 0.22) * 0.6 : 1;
    if (core.current) core.current.scale.setScalar(pulse);

    if (halo.current) {
      const t = s.clock.elapsedTime;
      const breath = 1 + Math.sin(t * 3 + spawnTime.current) * 0.08;
      halo.current.scale.setScalar(breath);
    }
  });

  const bodyColor = '#f9a03f';
  const glowColor = '#ffd27a';
  const emoji = getIngredientEmoji(orb.ingredient);

  const handleSlice = (e) => {
    e.stopPropagation();
    onSlice(state.position[0], state.position[1]);
  };

  return (
    <group ref={group} onPointerDown={handleSlice}>
      <group ref={core}>
        {/* Outer halo */}
        <mesh ref={halo} position={[0, 0, -0.05]} raycast={() => null}>
          <sphereGeometry args={[RADIUS * 1.55, 16, 16]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.22} depthWrite={false} />
        </mesh>
        {/* Mid glow */}
        <mesh raycast={() => null}>
          <sphereGeometry args={[RADIUS * 1.15, 16, 16]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.18} depthWrite={false} />
        </mesh>
        {/* Core sphere (this is the pointer hit target) */}
        <mesh>
          <sphereGeometry args={[RADIUS, 24, 24]} />
          <meshStandardMaterial
            color={bodyColor}
            emissive={bodyColor}
            emissiveIntensity={0.7}
            roughness={0.22}
            metalness={0.2}
          />
        </mesh>
        {/* Decorative segment bands (no raycast) for a 3D-fruit feel */}
        <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
          <torusGeometry args={[RADIUS * 0.88, 0.03, 8, 32]} />
          <meshBasicMaterial color="#d4a44a" transparent opacity={0.3} depthWrite={false} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
          <torusGeometry args={[RADIUS * 0.88, 0.03, 8, 32]} />
          <meshBasicMaterial color="#d4a44a" transparent opacity={0.3} depthWrite={false} />
        </mesh>
        {/* Glass highlight (decorative, no raycast) */}
        <mesh position={[-0.22, 0.26, 0.66]} raycast={() => null}>
          <sphereGeometry args={[0.17, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* Emoji as canvas Text — billboarded implicitly because it faces camera by default orientation */}
      <GameText
        position={[0, 0, 0.9]}
        fontSize={0.85}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {emoji}
      </GameText>

      {/* Ingredient label below the orb */}
      <GameText
        position={[0, -RADIUS - 0.35, 0]}
        fontSize={0.26}
        color="#f0f5f1"
        outlineWidth={0.016}
        outlineColor="#08110c"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        raycast={() => null}
      >
        {orb.ingredient}
      </GameText>
    </group>
  );
}
