import { useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';

import { SCENARIOS } from '@config/scenarios';
import { useMissionStore } from '@stores/mission';
import { useUIStore } from '@stores/ui';

export default function ZoomScaleUpdater() {
  const { camera } = useThree();
  const scenario = useMissionStore((s) => s.scenario);
  const setZoomScale = useUIStore((s) => s.setZoomScale);
  const scenarioConfig = SCENARIOS[scenario];
  const baseDistance = scenarioConfig.cameraDistance;

  // Calculate natural clamp bounds from scenario zoom limits
  const minScale = scenarioConfig.minZoomIn / baseDistance;
  const maxScale = scenarioConfig.maxZoomOut / baseDistance;

  const prevScale = useRef<number | null>(null);

  useFrame(() => {
    const distance = camera.position.length();
    const scale = distance / baseDistance;
    const clamped = Math.max(minScale, Math.min(maxScale, scale));

    // Always update on first frame (null), then only when changed significantly
    if (prevScale.current === null || Math.abs(clamped - prevScale.current) > 0.01) {
      prevScale.current = clamped;
      setZoomScale(clamped);
    }
  });

  return null;
}
