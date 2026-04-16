import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNinjaShaker as useGame } from './useNinjaShaker.js';
import Orb from './Orb.jsx';

const GRAVITY = -10;   // world units / s²
const FLOOR = -6;      // orbs below this line are considered off-screen

export default function Orbs({ onSlice }) {
  const orbs = useGame(s => s.orbs);
  const slice = useGame(s => s.slice);
  const despawn = useGame(s => s.despawn);
  const { viewport } = useThree();
  // Live-mutated refs keyed by orb id — React state is the source of truth
  // for WHICH orbs exist, not their per-frame transforms.
  const live = useRef(new Map());

  // Prune refs when orbs are removed from the store.
  const knownIds = new Set(orbs.map(o => o.id));
  for (const id of live.current.keys()) {
    if (!knownIds.has(id)) live.current.delete(id);
  }

  useFrame((_, dt) => {
    const step = Math.min(dt, 1 / 30); // clamp huge deltas on tab-switch
    for (const orb of orbs) {
      const state = live.current.get(orb.id);
      if (!state) continue;
      state.velocity[1] += GRAVITY * step;
      state.position[0] += state.velocity[0] * step;
      state.position[1] += state.velocity[1] * step;
      state.rotation += orb.spin * step;
      // Off-screen → let the store know (miss).
      if (state.position[1] < FLOOR) {
        despawn(orb.id);
      }
      // Horizontal world-width bounds: allow items to arc slightly past edges.
      if (Math.abs(state.position[0]) > viewport.width / 2 + 1) {
        despawn(orb.id);
      }
    }
  });

  return orbs.map(orb => (
    <Orb
      key={orb.id}
      orb={orb}
      registerState={(state) => live.current.set(orb.id, state)}
      onSlice={(worldX, worldY) => {
        slice(orb.id);
        onSlice(worldX, worldY, orb.correct ? '#34d399' : '#e74c3c');
      }}
    />
  ));
}
