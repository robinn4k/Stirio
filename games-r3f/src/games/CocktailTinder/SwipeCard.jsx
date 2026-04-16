import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getIngredientEmoji } from '../../data/cocktails.js';

const SWIPE_THRESHOLD = 1.4;       // world units horizontal
const FLYAWAY_SPEED = 14;          // units / s once past threshold
const SPRING = 10;                 // spring back to center

/**
 * Tinder-style swipe card. Dragged horizontally the card tilts and fades in a
 * YES / NOPE stamp. If released past the threshold it flies off; otherwise it
 * springs back to the center.
 */
export default function SwipeCard({ card, depth = 0, interactive = true, onSwipe }) {
  const group = useRef();
  const [dragging, setDragging] = useState(false);
  const state = useRef({ x: 0, y: 0, flying: null }); // flying: 'left' | 'right' | null
  const entered = useRef(false);

  useEffect(() => {
    state.current.x = 0;
    state.current.y = depth === 0 ? 1 : 0.6; // entrance from below
    state.current.flying = null;
    entered.current = false;
  }, [card.id, depth]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const s = state.current;

    // Entrance animation: ease towards 0.
    if (!entered.current) {
      s.y += (0 - s.y) * Math.min(1, dt * 8);
      if (Math.abs(s.y) < 0.01) entered.current = true;
    }

    if (s.flying && depth === 0) {
      s.x += (s.flying === 'right' ? FLYAWAY_SPEED : -FLYAWAY_SPEED) * dt;
      s.y += 0.6 * dt; // a little lift as it flies away
    } else if (!dragging && depth === 0) {
      s.x += (0 - s.x) * Math.min(1, dt * SPRING);
    }

    const z = depth === 0 ? 0 : -0.2;
    const scale = depth === 0 ? 1 : 0.94;
    group.current.position.set(s.x, s.y - depth * 0.2, z);
    group.current.rotation.z = -s.x * 0.18;
    group.current.scale.setScalar(scale);
  });

  const handlePointerDown = (e) => {
    if (!interactive || state.current.flying) return;
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    if (e.point) {
      state.current.x = e.point.x;
    }
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const x = state.current.x;
    if (Math.abs(x) > SWIPE_THRESHOLD) {
      const dir = x > 0 ? 'right' : 'left';
      state.current.flying = dir;
      onSwipe?.(dir);
    }
  };

  const emoji = getIngredientEmoji(card.ingredient);
  // Visual opacity of stamps depends on drag distance.
  const cardDragX = state.current.x;

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Shadow behind */}
      <mesh position={[0.05, -0.05, -0.05]}>
        <boxGeometry args={[3.2, 4, 0.02]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
      {/* Card */}
      <mesh>
        <boxGeometry args={[3.1, 3.9, 0.12]} />
        <meshStandardMaterial
          color="#1f0b15"
          emissive="#3b1322"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {/* Top glass highlight */}
      <mesh position={[0, 1.5, 0.065]}>
        <boxGeometry args={[3.0, 0.9, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
      {/* Outer edge stroke */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[3.25, 4.05, 0.02]} />
        <meshBasicMaterial color="#6b7280" transparent opacity={0.35} />
      </mesh>
      {/* Content via Html billboard */}
      <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: 210, display: 'flex', flexDirection: 'column', alignItems: 'center',
          userSelect: 'none', color: '#f0e6d3',
        }}>
          <div style={{
            width: 78, height: 78, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, marginBottom: 12,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.08), rgba(0,0,0,.4))',
            border: '1px solid rgba(255,255,255,.1)',
          }}>
            {emoji}
          </div>
          <div style={{
            fontSize: 19, fontWeight: 800, textAlign: 'center', lineHeight: 1.2,
          }}>
            {card.ingredient}
          </div>
          {/* Stamps appear when dragging past threshold */}
          {depth === 0 && (
            <>
              <div style={{
                position: 'absolute', top: 6, left: 10,
                transform: `rotate(-18deg)`,
                padding: '6px 12px', borderRadius: 8,
                border: '3px solid #f87171', color: '#f87171',
                fontWeight: 900, fontSize: 22, letterSpacing: 2,
                opacity: cardDragX < 0 ? Math.min(1, -cardDragX / SWIPE_THRESHOLD) : 0,
                transition: 'opacity .05s',
              }}>NOPE</div>
              <div style={{
                position: 'absolute', top: 6, right: 10,
                transform: `rotate(18deg)`,
                padding: '6px 12px', borderRadius: 8,
                border: '3px solid #34d399', color: '#34d399',
                fontWeight: 900, fontSize: 22, letterSpacing: 2,
                opacity: cardDragX > 0 ? Math.min(1, cardDragX / SWIPE_THRESHOLD) : 0,
                transition: 'opacity .05s',
              }}>SÍ</div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
