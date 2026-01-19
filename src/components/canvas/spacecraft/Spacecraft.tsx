import { Text } from '@react-three/drei';

import type { Vector3 } from '@orbital';

import { useUIStore } from '@stores/ui';

import { MainBody, type MainBodyProps } from './MainBody';
import { NavigationLight, type NavigationLightProps } from './NavigationLight';
import { SolarPanel, type SolarPanelProps } from './SolarPanel';

export interface ArmProps {
  position: Vector3;
  length: number;
  direction: 'x' | 'y' | 'z';
}

export interface SpacecraftProps {
  position?: Vector3;
  scale?: number;
  mainBody: MainBodyProps;
  solarPanels: SolarPanelProps[];
  arms?: ArmProps[];
  navigationLights?: NavigationLightProps[];
  label?: string;
  labelColor?: string;
}

function Arm({ position, length, direction }: ArmProps) {
  const size: [number, number, number] =
    direction === 'x'
      ? [length, 0.8, 0.8]
      : direction === 'y'
        ? [0.8, length, 0.8]
        : [0.8, 0.8, length];

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

export function Spacecraft({
  position = [0, 0, 0],
  scale = 1,
  mainBody,
  solarPanels,
  arms = [],
  navigationLights = [],
  label,
  labelColor = '#ffffff',
}: SpacecraftProps) {
  const zoomScale = useUIStore((s) => s.zoomScale);

  // Scale emissive intensity by zoom with sqrt curve for smoother transitions
  const emissiveScale = Math.max(0.3, Math.min(1, Math.sqrt(zoomScale)));
  const scaledMainBody = {
    ...mainBody,
    emissiveIntensity: (mainBody.emissiveIntensity ?? 0) * emissiveScale,
  };

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <MainBody {...scaledMainBody} />

      {arms.map((arm, index) => (
        <Arm key={`arm-${index}`} {...arm} />
      ))}

      {solarPanels.map((panel, index) => (
        <SolarPanel key={`panel-${index}`} {...panel} />
      ))}

      {navigationLights.map((light, index) => (
        <NavigationLight
          key={`light-${index}`}
          {...light}
          intensity={(light.intensity ?? 2) * emissiveScale}
        />
      ))}

      {label && (
        <Text
          position={[0, -mainBody.height - 8, 0]}
          fontSize={5}
          color={labelColor}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.15}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  );
}
