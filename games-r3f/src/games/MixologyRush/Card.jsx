import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getIngredientEmoji } from '../../data/cocktails.js';

const RETURN_SPEED = 6;

/**
 * A draggable ingredient card in 3D world-space.
 * - Spring-back to `homePosition` when not dragged.
 * - World-coordinate dragging via R3F pointer events. No Html portals so
 *   pointer capture is stable on mobile.
 */
export default function Card({ card, homePosition, onDrop }) {
  const group = useRef();
  const [dragging, setDragging] = useState(false);
  const posRef = useRef([...homePosition]);
  const captured = useRef({ target: null, id: null });

  useEffect(() => {
    posRef.current = [homePosition[0], homePosition[1] + 2, homePosition[2]];
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
    const dx = posRef.current[0] - homePosition[0];
    g.rotation.z = -dx * 0.12;
    g.rotation.y = dragging ? Math.sin(performance.now() / 260) * 0.08 : 0;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    try { e.target.setPointerCapture(e.pointerId); } catch { /* best-effort */ }
    captured.current = { target: e.target, id: e.pointerId };
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    if (e.point) {
      posRef.current[0] = e.point.x;
      posRef.current[1] = e.point.y;
    }
  };

  const releaseCapture = () => {
    const c = captured.current;
    if (c.target) {
      try { c.target.releasePointerCapture(c.id); } catch { /* ignore */ }
    }
    captured.current = { target: null, id: null };
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    releaseCapture();
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
      {/* Shadow */}
      <mesh position={[0.05, -0.4, -0.1]} raycast={null}>
        <planeGeometry args={[1.9, 0.3]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Glow plate */}
      <mesh position={[0, 0, -0.06]} raycast={null}>
        <planeGeometry args={[2.0, 0.85]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={dragging ? 0.55 : 0.28} depthWrite={false} />
      </mesh>
      {/* Card body (main hitbox) */}
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
      <mesh position={[0, 0.16, 0.072]} raycast={null}>
        <planeGeometry args={[1.78, 0.35]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {/* Left accent bar */}
      <mesh position={[-0.78, 0, 0.072]} raycast={null}>
        <planeGeometry args={[0.06, 0.58]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
      </mesh>
      {/* Emoji badge circle */}
      <mesh position={[-0.55, 0, 0.075]} raycast={null}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Emoji as Text */}
      <Text
        position={[-0.55, 0, 0.08]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        raycast={null}
      >
        {emoji}
      </Text>
      {/* Ingredient name as Text */}
      <Text
        position={[0.15, 0, 0.08]}
        fontSize={0.14}
        color="#f5f3ff"
        outlineWidth={0.008}
        outlineColor="#1a0e28"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.0}
        textAlign="center"
        fontWeight="bold"
        raycast={null}
      >
        {card.ingredient}
      </Text>
    </group>
  );
}
