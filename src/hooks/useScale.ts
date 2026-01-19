import { SCENARIOS } from '@config/scenarios';
import { useMissionStore } from '@stores/mission';
import { useUIStore } from '@stores/ui';

/**
 * Hook that returns a unified scale factor combining the scenario's visual scale
 * with zoom-responsive scaling. Use this to scale spacecraft, waypoints, and
 * other 3D objects that should maintain visibility at any zoom level.
 */
export function useScale(): number {
  const scenario = useMissionStore((s) => s.scenario);
  const zoomScale = useUIStore((s) => s.zoomScale);
  const visualScale = SCENARIOS[scenario].visualScale;
  return visualScale * zoomScale;
}
