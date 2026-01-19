import { useMemo, useState } from 'react';

import { GripHorizontal, Minus } from 'lucide-react';

import { interpolateTrajectory, type Vector3 } from '@orbital';

import { useHotkey } from '@hooks/useHotkey';
import { useMissionStore } from '@stores/mission';
import { findNearestPointIndex, useSimulationStore } from '@stores/simulation';
import { useUIStore } from '@stores/ui';
import { computeDistance, computeDistanceTraveled } from '@utils/metrics';

import HUDMetrics from './HUDMetrics';
import HUDPlayback from './HUDPlayback';
import HUDPosition from './HUDPosition';
import HUDVelocity from './HUDVelocity';

export default function HUD() {
  const hudVisible = useUIStore((s) => s.hudVisible);
  const toggleHUD = useUIStore((s) => s.toggleHUD);

  useHotkey('h', toggleHUD);

  // Mission state
  const initialPosition = useMissionStore((s) => s.initialPosition);
  const trajectoryPoints = useMissionStore((s) => s.trajectoryPoints);

  // Simulation state
  const time = useSimulationStore((s) => s.time);
  const playing = useSimulationStore((s) => s.playing);

  // Local UI state
  const [minimized, setMinimized] = useState(false);

  // Current position/velocity from trajectory or initial
  const isSimulating = time > 0 || playing;
  const hasTrajectory = trajectoryPoints.length > 0;

  const currentPosition = useMemo(() => {
    if (isSimulating && hasTrajectory) {
      const interpolated = interpolateTrajectory(trajectoryPoints, time);
      if (interpolated) {
        return interpolated.position;
      }
    }
    return initialPosition;
  }, [isSimulating, hasTrajectory, trajectoryPoints, time, initialPosition]);

  const currentVelocity = useMemo<Vector3>(() => {
    if (isSimulating && hasTrajectory) {
      const interpolated = interpolateTrajectory(trajectoryPoints, time);
      if (interpolated) {
        return interpolated.velocity;
      }
    }
    return [0, 0, 0];
  }, [isSimulating, hasTrajectory, trajectoryPoints, time]);

  const distance = computeDistance(currentPosition);

  const distanceTraveled = useMemo(() => {
    if (!isSimulating || !hasTrajectory) return 0;
    const currentPointIndex = findNearestPointIndex(trajectoryPoints, time);
    return computeDistanceTraveled(trajectoryPoints, currentPointIndex);
  }, [isSimulating, hasTrajectory, trajectoryPoints, time]);

  if (!hudVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-72 z-50">
      <div className="bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700 bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <GripHorizontal size={14} className="text-zinc-500" />
            <span className="text-sm font-medium text-zinc-200">
              Mission Control
            </span>
          </div>
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <Minus size={14} className="text-zinc-400" />
          </button>
        </div>

        {/* Content - collapsible */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out
            ${minimized ? 'max-h-0' : 'max-h-125'}`}
        >
          <div className="p-3 space-y-2">
            <HUDPlayback />

            {/* Divider */}
            <div className="border-t border-zinc-700" />

            <HUDPosition
              position={currentPosition}
              velocity={currentVelocity}
            />

            <HUDVelocity velocity={currentVelocity} />

            <HUDMetrics
              distance={distance}
              distanceTraveled={distanceTraveled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
