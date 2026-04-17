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

  const baseColor = '#1a1130';
  const midColor = '#3b2464';
  const edgeColor = '#c4a7ff';
  const accent = '#d4a44a';
  const emoji = getIngredientEmoji(card.ingredient);

  return (
    <group ref={group}>
      {/* Shadow */}
      <mesh position={[0.05, -0.46, -0.1]} raycast={() => null}>
        <planeGeometry args={[2.05, 0.35]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Glow plate */}
      <mesh position={[0, 0, -0.06]} raycast={() => null}>
        <planeGeometry args={[2.15, 0.95]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={dragging ? 0.6 : 0.32} depthWrite={false} />
      </mesh>
      {/* Card body (decorative) */}
      <mesh raycast={() => null}>
        <boxGeometry args={[1.95, 0.78, 0.14]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={midColor}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>
      {/* Glossy top half */}
      <mesh position={[0, 0.18, 0.072]} raycast={() => null}>
        <planeGeometry args={[1.93, 0.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Inner shimmer band */}
      <mesh position={[0, 0.22, 0.073]} raycast={() => null}>
        <planeGeometry args={[1.9, 0.18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* Left accent bar */}
      <mesh position={[-0.86, 0, 0.072]} raycast={() => null}>
        <planeGeometry args={[0.06, 0.66]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
      </mesh>
      {/* Emoji badge rim ring */}
      <mesh position={[-0.6, 0, 0.074]} raycast={() => null}>
        <circleGeometry args={[0.27, 28]} />
        <meshBasicMaterial color={accent} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Emoji badge circle */}
      <mesh position={[-0.6, 0, 0.075]} raycast={() => null}>
        <circleGeometry args={[0.24, 28]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Emoji as Text */}
      <GameText
        position={[-0.6, 0, 0.08]}
        fontSize={0.36}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {emoji}
      </GameText>
      {/* Ingredient name as Text */}
      <GameText
        position={[0.2, 0, 0.08]}
        fontSize={0.16}
        color="#f5f3ff"
        outlineWidth={0.01}
        outlineColor="#1a0e28"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.1}
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
        <planeGeometry args={[2.1, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
