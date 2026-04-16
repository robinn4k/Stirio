import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getIngredientEmoji } from '../../data/cocktails.js';

const RETURN_SPEED = 6; // units per second

/**
 * A single draggable ingredient card in 3D world-space.
 * - Position springs back to `homePosition` when not dragged.
 * - During drag the pointer world coords drive position directly.
 */
export default function Card({ card, homePosition, onDrop }) {
  const group = useRef();
  const { viewport, camera } = useThree();
  const [dragging, setDragging] = useState(false);
  const posRef = useRef([...homePosition]);
  const mounted = useRef(false);

  // Fresh entrance animation when the card first appears.
  useEffect(() => {
    posRef.current = [homePosition[0], homePosition[1] + 2, homePosition[2]];
    mounted.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (!group.current) return;
    const g = group.current;
    if (!dragging) {
      const step = Math.min(1, dt * RETURN_SPEED);
      posRef.current[0] += (homePosition[0] - posRef.current[0]) * step;
      posRef.current[1] += (homePosition[1] - posRef.current[1]) * step;
      posRef.current[2] += (homePosition[2] - posRef.current[2]) * step;
    }
    g.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
    // Gentle tilt based on horizontal drag delta from home.
    const dx = posRef.current[0] - homePosition[0];
    g.rotation.z = -dx * 0.12;
    g.rotation.y = dragging ? Math.sin(performance.now() / 260) * 0.08 : 0;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    // Project pointer into the z=0 plane using camera + pointer coords.
    const w = viewport.width;
    const h = viewport.height;
    // pointer is in NDC (-1..1) via e.pointer; fall back to unproject via e.point.
    if (e.point) {
      posRef.current[0] = e.point.x;
      posRef.current[1] = e.point.y;
    }
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    onDrop(card.id, posRef.current);
  };

  const baseColor = card.correct ? '#3b1f5a' : '#1f2937';
  const midColor = card.correct ? '#6b4fa2' : '#374151';
  const edgeColor = card.correct ? '#c4a7ff' : '#6b7280';
  const accent = card.correct ? '#a78bfa' : '#9ca3af';
  const emoji = getIngredientEmoji(card.ingredient);

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Shadow disc under the card */}
      <mesh position={[0.05, -0.4, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 0.7]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      {/* Outer glow plate */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[2.0, 0.85]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={dragging ? 0.55 : 0.28} />
      </mesh>
      {/* Card body (darker) */}
      <mesh>
        <boxGeometry args={[1.8, 0.7, 0.14]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={midColor}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.25}
        />
      </mesh>
      {/* Glossy top half */}
      <mesh position={[0, 0.16, 0.072]}>
        <planeGeometry args={[1.78, 0.35]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
      {/* Left accent bar */}
      <mesh position={[-0.78, 0, 0.072]}>
        <planeGeometry args={[0.06, 0.58]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.1}
        />
      </mesh>
      {/* Emoji badge circle behind the emoji */}
      <mesh position={[-0.55, 0, 0.075]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} />
      </mesh>
      {/* Content via Html billboard */}
      <Html center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none',
          width: 170, padding: '4px 10px',
        }}>
          <div style={{ fontSize: 30, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.55))' }}>{emoji}</div>
          <div style={{
            fontSize: 12, color: '#f5f3ff', fontWeight: 800, lineHeight: 1.15,
            letterSpacing: 0.2, textShadow: '0 1px 3px rgba(0,0,0,.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {card.ingredient}
          </div>
        </div>
      </Html>
    </group>
  );
}
