import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameText from '../../components/GameText.jsx';
import { getIngredientEmoji } from '../../data/cocktails.js';
import useDrag from '../../hooks/useDrag.js';

const RETURN_SPEED = 6;

/**
 * Draggable ingredient card in 3D world-space.
 * - Spring-back to `homePosition` when not dragged.
 * - Drag handled by useDrag: attaches pointer listeners directly to the
 *   canvas DOM so moves keep firing even after the finger leaves the card.
 *   The previous mesh-level onPointerMove only fired while the pointer was
 *   still over the card, which meant real drags got stuck.
 * - A dedicated invisible hit-plane in front of the card catches the
 *   initial pointerdown, so decorative layers + <GameText> labels never
 *   swallow it.
 */
export default function Card({ card, homePosition, onDrop }) {
  const group = useRef();
  const posRef = useRef([...homePosition]);

  useEffect(() => {
    posRef.current = [homePosition[0], homePosition[1] + 2, homePosition[2]];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { dragging, startDrag } = useDrag({
    onMove: (x, y) => {
      posRef.current[0] = x;
      posRef.current[1] = y;
    },
    onEnd: () => {
      onDrop(card.id, posRef.current);
    },
  });

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

  const baseColor = card.correct ? '#3b1f5a' : '#1f2937';
  const midColor = card.correct ? '#6b4fa2' : '#374151';
  const edgeColor = card.correct ? '#c4a7ff' : '#6b7280';
  const accent = card.correct ? '#a78bfa' : '#9ca3af';
  const emoji = getIngredientEmoji(card.ingredient);

  return (
    <group ref={group}>
      {/* Shadow */}
      <mesh position={[0.05, -0.4, -0.1]} raycast={() => null}>
        <planeGeometry args={[1.9, 0.3]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Glow plate */}
      <mesh position={[0, 0, -0.06]} raycast={() => null}>
        <planeGeometry args={[2.0, 0.85]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={dragging ? 0.55 : 0.28} depthWrite={false} />
      </mesh>
      {/* Card body (decorative) */}
      <mesh raycast={() => null}>
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
      <mesh position={[0, 0.16, 0.072]} raycast={() => null}>
        <planeGeometry args={[1.78, 0.35]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {/* Left accent bar */}
      <mesh position={[-0.78, 0, 0.072]} raycast={() => null}>
        <planeGeometry args={[0.06, 0.58]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
      </mesh>
      {/* Emoji badge circle */}
      <mesh position={[-0.55, 0, 0.075]} raycast={() => null}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Emoji as Text */}
      <GameText
        position={[-0.55, 0, 0.08]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {emoji}
      </GameText>
      {/* Ingredient name as Text */}
      <GameText
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
        raycast={() => null}
      >
        {card.ingredient}
      </GameText>
      {/* Invisible hit-plane in FRONT of everything — this is the only
          raycastable object on the card so the initial pointerdown always
          lands here regardless of what decorative layer is topmost. */}
      <mesh position={[0, 0, 0.2]} onPointerDown={startDrag}>
        <planeGeometry args={[2.0, 0.85]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
