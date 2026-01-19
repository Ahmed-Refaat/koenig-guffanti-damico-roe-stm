import { useFrame } from '@react-three/fiber';

import { useMissionStore } from '@stores/mission';
import { useSimulationStore } from '@stores/simulation';

/**
 * Headless component that drives the simulation animation loop.
 * Uses useFrame to advance simulation time based on playback speed.
 * Must be rendered inside R3F Canvas.
 *
 * Note: Simulation reset is handled by useStoreSync in App.tsx,
 * which resets whenever trajectoryPoints changes.
 */
export default function AnimationController() {
  const playing = useSimulationStore((s) => s.playing);
  const tick = useSimulationStore((s) => s.tick);

  useFrame((_, delta) => {
    if (!playing) return;

    const { missionPlan } = useMissionStore.getState();
    if (!missionPlan) return;

    tick(delta, missionPlan.totalTime);
  });

  // This is a headless component - no visual output
  return null;
}
