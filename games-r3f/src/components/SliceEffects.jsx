import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLES = 14;
const DURATION = 0.65;

function ParticleBurst({ position, color }) {
  const group = useRef();
  const ageRef = useRef(0);
  // Pre-compute initial velocities so each particle stays deterministic.
  const velocities = useRef(
    Array.from({ length: PARTICLES }, () => {
      const a = Math.random() * Math.PI * 2;
      const s = 1.2 + Math.random() * 1.6;
      return new THREE.Vector3(Math.cos(a) * s, Math.sin(a) * s, 0);
    })
  );

  useFrame((_, dt) => {
    ageRef.current += dt;
    const t = Math.min(1, ageRef.current / DURATION);
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const v = velocities.current[i];
      child.position.set(v.x * t * 1.8, v.y * t * 1.8 - 2.5 * t * t, 0);
      child.material.opacity = 1 - t;
      child.scale.setScalar(1 - t * 0.7);
    });
  });

  return (
    <group ref={group} position={position}>
      {velocities.current.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function SliceEffects({ slices }) {
  return slices.map(s => (
    <ParticleBurst key={s.id} position={s.position} color={s.color} />
  ));
}
