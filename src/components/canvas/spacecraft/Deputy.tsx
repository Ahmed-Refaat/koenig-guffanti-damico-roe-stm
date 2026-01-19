import { useMemo } from 'react';

import { interpolateTrajectory } from '@orbital';

import { useScale } from '@hooks/useScale';
import { useMissionStore } from '@stores/mission';
import { useSimulationStore } from '@stores/simulation';
import { ricToPosition } from '@utils/coordinates';

import { Spacecraft } from './Spacecraft';

export default function Deputy() {
  const scale = useScale();
  const initialPosition = useMissionStore((state) => state.initialPosition);
  const trajectoryPoints = useMissionStore((state) => state.trajectoryPoints);

  const playing = useSimulationStore((state) => state.playing);
  const time = useSimulationStore((state) => state.time);

  // When simulation is active (time > 0 or playing), use trajectory position
  // Otherwise use initial position
  const isSimulating = time > 0 || playing;
  const hasTrajectory = trajectoryPoints.length > 0;

  const position = useMemo(() => {
    if (isSimulating && hasTrajectory) {
      const interpolated = interpolateTrajectory(trajectoryPoints, time);
      if (interpolated) {
        return interpolated.position;
      }
    }
    return initialPosition;
  }, [isSimulating, hasTrajectory, trajectoryPoints, time, initialPosition]);

  return (
    <Spacecraft
      position={ricToPosition(position)}
      scale={1.8 * scale}
      label="Deputy"
      labelColor="#6688ff"
      mainBody={{
        width: 6,
        height: 6,
        depth: 8,
        color: '#4466cc',
        emissive: '#2266ff',
        emissiveIntensity: 0.6,
      }}
      arms={[
        // Left arm - connects body edge (x=-3) to panel (x=-14)
        { position: [-8.5, 0, 0], length: 11, direction: 'x' },
        // Right arm
        { position: [8.5, 0, 0], length: 11, direction: 'x' },
      ]}
      solarPanels={[
        // Left panel
        {
          width: 1,
          height: 10,
          depth: 8,
          position: [-14, 0, 0],
        },
        // Right panel
        {
          width: 1,
          height: 10,
          depth: 8,
          position: [14, 0, 0],
        },
      ]}
      navigationLights={[
        { position: [0, 4, 5], color: '#4488ff', intensity: 5, distance: 150 },
        { position: [0, -4, 5], color: '#4488ff', intensity: 5, distance: 150 },
      ]}
    />
  );
}
