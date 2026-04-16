import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getIngredientEmoji } from '../../data/cocktails.js';

const SWIPE_THRESHOLD = 1.4;
const FLYAWAY_SPEED = 16;
const FLYAWAY_TIME = 0.35;       // seconds before we notify the store
const SPRING = 10;

/**
 * Tinder-style swipe card rendered entirely in-canvas (no Html portals).
 * Stamps and emblem use drei <Text>. The fly-away animation runs fully
 * before we notify the store that the swipe is done — this prevents the
 * card from vanishing mid-animation, which previously felt "stuck".
 */
export default function SwipeCard({ card, depth = 0, interactive = true, onSwipe }) {
  const group = useRef();
  const noStampRef = useRef();
  const yesStampRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [, forceTick] = useState(0);
  const s = useRef({ x: 0, y: depth === 0 ? 1 : 0.6, flyingDir: null, flyingAge: 0, notified: false, entered: false });
  const captured = useRef({ target: null, id: null });

  useEffect(() => {
    s.current.x = 0;
    s.current.y = depth === 0 ? 1 : 0.6;
    s.current.flyingDir = null;
    s.current.flyingAge = 0;
    s.current.notified = false;
    s.current.entered = false;
  }, [card.id, depth]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const st = s.current;

    if (!st.entered) {
      st.y += (0 - st.y) * Math.min(1, dt * 8);
      if (Math.abs(st.y) < 0.01) st.entered = true;
    }

    if (st.flyingDir && depth === 0) {
      st.flyingAge += dt;
      st.x += (st.flyingDir === 'right' ? FLYAWAY_SPEED : -FLYAWAY_SPEED) * dt;
      st.y += 0.6 * dt;
      if (!st.notified && st.flyingAge > FLYAWAY_TIME) {
        st.notified = true;
        onSwipe?.(st.flyingDir);
      }
    } else if (!dragging && depth === 0) {
      st.x += (0 - st.x) * Math.min(1, dt * SPRING);
    }

    const z = depth === 0 ? 0 : -0.2;
    const scale = depth === 0 ? 1 : 0.94;
    group.current.position.set(st.x, st.y - depth * 0.2, z);
    group.current.rotation.z = -st.x * 0.18;
    group.current.scale.setScalar(scale);

    // Drive stamp opacity (Text materials hold their own opacity).
    if (depth === 0) {
      const no = st.x < 0 ? Math.min(1, -st.x / SWIPE_THRESHOLD) : 0;
      const yes = st.x > 0 ? Math.min(1, st.x / SWIPE_THRESHOLD) : 0;
      if (noStampRef.current) noStampRef.current.material.opacity = no;
      if (yesStampRef.current) yesStampRef.current.material.opacity = yes;
    }
  });

  const handlePointerDown = (e) => {
    if (!interactive || s.current.flyingDir) return;
    e.stopPropagation();
    try { e.target.setPointerCapture(e.pointerId); } catch { /* best-effort */ }
    captured.current = { target: e.target, id: e.pointerId };
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    if (e.point) s.current.x = e.point.x;
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
    const x = s.current.x;
    if (Math.abs(x) > SWIPE_THRESHOLD) {
      s.current.flyingDir = x > 0 ? 'right' : 'left';
      s.current.flyingAge = 0;
    }
  };

  const emoji = getIngredientEmoji(card.ingredient);
  const strokeColor = card.belongs ? '#a78bfa' : '#64748b';

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Shadow plane below the card */}
      <mesh position={[0.08, -2.2, -0.15]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[3.0, 1.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Glow halo */}
      <mesh position={[0, 0, -0.25]} raycast={() => null}>
        <planeGeometry args={[3.8, 4.6]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Card base (main hitbox) */}
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
      {/* Top warm band */}
      <mesh position={[0, 0.85, 0.073]} raycast={() => null}>
        <planeGeometry args={[3.08, 2.0]} />
        <meshBasicMaterial color="#3b1322" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.55, 0.074]} raycast={() => null}>
        <planeGeometry args={[3.08, 0.6]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* Accent line under the emblem */}
      <mesh position={[0, 0.25, 0.078]} raycast={() => null}>
        <planeGeometry args={[1.6, 0.03]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.8} />
      </mesh>
      {/* Outer edge stroke */}
      <mesh position={[0, 0, -0.05]} raycast={() => null}>
        <boxGeometry args={[3.22, 4.04, 0.02]} />
        <meshBasicMaterial color={strokeColor} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Emblem disc */}
      <mesh position={[0, 0.95, 0.075]} raycast={() => null}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.95, 0.08]} raycast={() => null}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial
          color="#1a0a14"
          emissive="#3b1322"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Emoji (big) */}
      <Text
        position={[0, 0.95, 0.09]}
        fontSize={0.75}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {emoji}
      </Text>
      {/* Ingredient name */}
      <Text
        position={[0, -0.1, 0.08]}
        fontSize={0.3}
        color="#f0e6d3"
        outlineWidth={0.015}
        outlineColor="#0a0608"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.7}
        textAlign="center"
        fontWeight="bold"
        raycast={() => null}
      >
        {card.ingredient}
      </Text>
      {/* Subtitle */}
      <Text
        position={[0, -0.55, 0.08]}
        fontSize={0.13}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
        raycast={() => null}
      >
        INGREDIENTE
      </Text>
      {/* NOPE / SÍ stamps — only on the foreground card */}
      {depth === 0 && (
        <>
          <Text
            ref={noStampRef}
            position={[-1.0, 1.2, 0.12]}
            rotation={[0, 0, 0.38]}
            fontSize={0.55}
            color="#f87171"
            outlineWidth={0.025}
            outlineColor="#1a0a18"
            anchorX="center"
            anchorY="middle"
            fontWeight="900"
            raycast={() => null}
            material-transparent
            material-opacity={0}
          >
            NOPE
          </Text>
          <Text
            ref={yesStampRef}
            position={[1.0, 1.2, 0.12]}
            rotation={[0, 0, -0.38]}
            fontSize={0.55}
            color="#34d399"
            outlineWidth={0.025}
            outlineColor="#071a10"
            anchorX="center"
            anchorY="middle"
            fontWeight="900"
            raycast={() => null}
            material-transparent
            material-opacity={0}
          >
            SÍ
          </Text>
        </>
      )}
    </group>
  );
}
