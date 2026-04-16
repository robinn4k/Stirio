import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Ambient animated bokeh spheres behind the playfield.
 * Cheap but adds depth and colour to the scene. Runs entirely on the GPU
 * via position updates on a small fixed set of meshes.
 *
 * Props:
 * - colors: array of hex strings (cycled through the sphere pool).
 * - count: how many spheres (default 12).
 * - depth: range on z axis (spheres placed between -depth and 0).
 */
export default function BokehBackground({ colors = ['#ffffff'], count = 12, depth = 6 }) {
  const group = useRef();
  // Precompute per-sphere parameters.
  const items = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      color: colors[i % colors.length],
      x: (Math.random() - 0.5) * 18,
      y: (Math.random() - 0.5) * 14,
      z: -depth * (0.2 + Math.random() * 0.8),
      r: 0.5 + Math.random() * 1.4,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      ampY: 0.4 + Math.random() * 0.6,
      ampX: 0.3 + Math.random() * 0.5,
    }))
  ), [colors, count, depth]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const it = items[i];
      m.position.x = it.x + Math.sin(t * it.speed + it.phase) * it.ampX;
      m.position.y = it.y + Math.cos(t * it.speed * 0.7 + it.phase) * it.ampY;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, it.z]}>
          <sphereGeometry args={[it.r, 12, 12]} />
          <meshBasicMaterial color={it.color} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}
