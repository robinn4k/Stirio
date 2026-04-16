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
      {/* Soft shadow below card */}
      <mesh position={[0.08, -2.2, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 1.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>
      {/* Soft glow halo behind card */}
      <mesh position={[0, 0, -0.25]}>
        <planeGeometry args={[3.8, 4.6]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.15} />
      </mesh>
      {/* Card back (deepest tone) */}
      <mesh>
        <boxGeometry args={[3.1, 3.9, 0.14]} />
        <meshStandardMaterial
          color="#1a0a18"
          emissive="#3b1322"
          emissiveIntensity={0.18}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>
      {/* Top gradient band — warm rose */}
      <mesh position={[0, 0.85, 0.073]}>
        <planeGeometry args={[3.08, 2.0]} />
        <meshBasicMaterial color="#3b1322" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0.074]}>
        <planeGeometry args={[3.08, 0.6]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.2} />
      </mesh>
      {/* Inner stroke */}
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[3.0, 3.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>
      {/* Accent line under the emblem */}
      <mesh position={[0, 0.2, 0.078]}>
        <planeGeometry args={[1.6, 0.03]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.7} />
      </mesh>
      {/* Outer edge stroke */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.22, 4.04, 0.02]} />
        <meshBasicMaterial color={card.belongs ? '#a78bfa' : '#64748b'} transparent opacity={0.45} />
      </mesh>
      {/* Content via Html billboard */}
      <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: 230, display: 'flex', flexDirection: 'column', alignItems: 'center',
          userSelect: 'none', color: '#f0e6d3', position: 'relative',
        }}>
          {/* Emblem */}
          <div style={{
            width: 108, height: 108, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 58, marginTop: -30, marginBottom: 18,
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.18) 0%, rgba(248,113,113,.25) 40%, rgba(10,6,10,.7) 100%)',
            border: '2px solid rgba(248,113,113,.4)',
            boxShadow: '0 8px 24px rgba(248,113,113,.25), inset 0 0 20px rgba(255,255,255,.08)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.5))',
          }}>
            {emoji}
          </div>
          {/* Ingredient name */}
          <div style={{
            fontSize: 21, fontWeight: 900, textAlign: 'center', lineHeight: 1.15,
            letterSpacing: 0.4, textShadow: '0 2px 6px rgba(0,0,0,.6)',
            padding: '0 12px',
          }}>
            {card.ingredient}
          </div>
          {/* Subtitle */}
          <div style={{
            marginTop: 14, fontSize: 10, color: '#cbd5e1', letterSpacing: 1.2,
            textTransform: 'uppercase', opacity: 0.7,
          }}>
            ingrediente
          </div>

          {/* Stamps appear when dragging past threshold */}
          {depth === 0 && (
            <>
              <div style={{
                position: 'absolute', top: -42, left: -6,
                transform: `rotate(-22deg)`,
                padding: '8px 16px', borderRadius: 10,
                border: '4px solid #f87171', color: '#f87171',
                fontWeight: 900, fontSize: 28, letterSpacing: 3,
                background: 'rgba(248,113,113,.08)',
                opacity: cardDragX < 0 ? Math.min(1, -cardDragX / SWIPE_THRESHOLD) : 0,
                transition: 'opacity .05s',
                boxShadow: '0 0 20px rgba(248,113,113,.4)',
              }}>NOPE</div>
              <div style={{
                position: 'absolute', top: -42, right: -6,
                transform: `rotate(22deg)`,
                padding: '8px 18px', borderRadius: 10,
                border: '4px solid #34d399', color: '#34d399',
                fontWeight: 900, fontSize: 28, letterSpacing: 3,
                background: 'rgba(52,211,153,.08)',
                opacity: cardDragX > 0 ? Math.min(1, cardDragX / SWIPE_THRESHOLD) : 0,
                transition: 'opacity .05s',
                boxShadow: '0 0 20px rgba(52,211,153,.4)',
              }}>SÍ</div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
