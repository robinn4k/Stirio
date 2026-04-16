import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

/**
 * Central 3D shaker target: glowing sphere with bobbing emoji label and an
 * outer ring. Drop zone for the Mixology Rush cards.
 */
export default function Shaker({ position, radius }) {
  const ref = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const emojiRef = useRef();

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
    if (emojiRef.current) {
      emojiRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08 + 0.05;
    }
  });

  return (
    <group>
      {/* soft outer glow disc */}
      <mesh ref={glowRef} position={[position[0], position[1], position[2] - 0.2]} raycast={() => null}>
        <circleGeometry args={[radius * 1.9, 48]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* mid glow disc */}
      <mesh position={[position[0], position[1], position[2] - 0.12]} raycast={() => null}>
        <circleGeometry args={[radius * 1.4, 48]} />
        <meshBasicMaterial color="#c4a7ff" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      {/* animated ring */}
      <mesh ref={ringRef} position={position} raycast={() => null}>
        <torusGeometry args={[radius + 0.18, 0.035, 12, 48]} />
        <meshStandardMaterial
          color="#d4a44a"
          emissive="#d4a44a"
          emissiveIntensity={1.1}
          roughness={0.3}
        />
      </mesh>
      {/* inner sphere (ref mesh provides the bobbing Y) */}
      <mesh ref={ref} position={position} raycast={() => null}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color="#2d1f3d"
          emissive="#6b4fa2"
          emissiveIntensity={0.45}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>
      {/* bobbing emoji + label rendered as canvas Text */}
      <Text
        ref={emojiRef}
        position={[position[0], position[1] + 0.05, position[2] + 0.1]}
        fontSize={0.75}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        🍸
      </Text>
      <Text
        position={[position[0], position[1] - radius - 0.4, position[2]]}
        fontSize={0.2}
        color="#cfd8dc"
        outlineWidth={0.015}
        outlineColor="#08110c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
        raycast={() => null}
      >
        ARRASTRA AQUÍ
      </Text>
    </group>
  );
}
