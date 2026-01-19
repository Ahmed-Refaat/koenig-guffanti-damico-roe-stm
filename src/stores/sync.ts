import { useMissionStore } from './mission';
import { useSimulationStore } from './simulation';

// Cross-store subscriptions - reset simulation when trajectory changes
useMissionStore.subscribe(
  (state) => state.trajectoryPoints,
  () => useSimulationStore.getState().reset()
);
