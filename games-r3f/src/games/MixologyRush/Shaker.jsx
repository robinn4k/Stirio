import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * Central 3D shaker target: a large glowing sphere with a bobbing emoji
 * label and an outer ring ring. This is the drop zone.
 */
export default function Shaker({ position, radius }) {
  const ref = useRef();
  const ringRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08;
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.06;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + (Math.sin(t * 1.8) + 1) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* soft outer glow disc */}
      <mesh ref={glowRef} position={[0, 0, -0.2]}>
        <circleGeometry args={[radius * 1.9, 64]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.18} />
      </mesh>
      {/* mid glow disc */}
      <mesh position={[0, 0, -0.12]}>
        <circleGeometry args={[radius * 1.4, 64]} />
        <meshBasicMaterial color="#c4a7ff" transparent opacity={0.1} />
      </mesh>
      {/* animated ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[radius + 0.18, 0.035, 16, 64]} />
        <meshStandardMaterial
          color="#d4a44a"
          emissive="#d4a44a"
          emissiveIntensity={1.1}
          roughness={0.3}
        />
      </mesh>
      {/* inner sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color="#2d1f3d"
          emissive="#6b4fa2"
          emissiveIntensity={0.45}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>
      {/* tiny orbiting highlight */}
      <mesh position={[radius * 0.45, radius * 0.45, 0.35]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
      <Html center distanceFactor={7} position={[0, 0, 0.1]} style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none',
        }}>
          <div style={{ fontSize: 32, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))' }}>🍸</div>
          <div style={{
            marginTop: 2, fontSize: 9, color: '#cfd8dc', letterSpacing: 0.6,
            padding: '2px 8px', borderRadius: 10, background: 'rgba(10,8,20,.6)',
            border: '1px solid rgba(167,139,250,.55)', textTransform: 'uppercase',
          }}>
            arrastra aquí
          </div>
        </div>
      </Html>
    </group>
  );
}
