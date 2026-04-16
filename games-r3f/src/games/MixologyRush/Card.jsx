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

  const baseColor = card.correct ? '#6b4fa2' : '#374151';
  const edgeColor = card.correct ? '#a78bfa' : '#6b7280';
  const emoji = getIngredientEmoji(card.ingredient);

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Card body: rounded box */}
      <mesh>
        <boxGeometry args={[1.6, 0.55, 0.12]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.25}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      {/* Highlight strip on top */}
      <mesh position={[0, 0.23, 0.065]}>
        <boxGeometry args={[1.58, 0.08, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      {/* Edge glow */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.72, 0.67, 0.02]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={0.35} />
      </mesh>
      {/* Content: emoji + label via Html billboard */}
      <Html center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none',
          width: 150, padding: '4px 8px',
        }}>
          <div style={{ fontSize: 26 }}>{emoji}</div>
          <div style={{
            fontSize: 11, color: '#eee', fontWeight: 700, lineHeight: 1.15,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {card.ingredient}
          </div>
        </div>
      </Html>
    </group>
  );
}
