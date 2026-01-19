import type {
  ClassicalOrbitalElements,
  DragConfig,
  MissionPlan,
  RelativeState,
  TrajectoryPoint,
  Vector3,
  Waypoint,
} from '@orbital';
import {
  generateMissionTrajectory,
  planMission,
  replanFromWaypoint,
  validateTargetingConfig,
} from '@orbital';

import { type ScenarioKey, SCENARIOS } from '@config/scenarios';

export interface MissionError {
  message: string;
  suggestion?: string;
  timestamp: number;
}

/** Eccentricity threshold for eccentric drag model (from Koenig et al. 2017) */
export const ECCENTRICITY_THRESHOLD = 0.05;

export interface ComputeMissionResult {
  missionPlan: MissionPlan | null;
  trajectoryPoints: readonly TrajectoryPoint[];
  error: MissionError | null;
}

/** Recompute mission plan and trajectory from scratch */
export function computeMission(
  waypoints: Waypoint[],
  chief: ClassicalOrbitalElements,
  initialPosition: Vector3,
  includeJ2: boolean,
  includeDrag: boolean,
  daDotDrag: number,
  dexDotDrag: number,
  deyDotDrag: number,
  scenario: ScenarioKey
): ComputeMissionResult {
  if (waypoints.length === 0) {
    return { missionPlan: null, trajectoryPoints: [], error: null };
  }

  const initialState: RelativeState = {
    position: initialPosition,
    velocity: [0, 0, 0],
  };

  try {
    // Auto-select drag model based on eccentricity
    const isNearCircular = chief.eccentricity < ECCENTRICITY_THRESHOLD;
    const dragConfig: DragConfig = isNearCircular
      ? { type: 'arbitrary', daDotDrag, dexDotDrag, deyDotDrag }
      : { type: 'eccentric', daDotDrag };

    const options = {
      includeJ2,
      includeDrag,
      dragConfig,
    };

    // Validate configuration before planning
    const validation = validateTargetingConfig(chief, options);
    if (!validation.valid) {
      return {
        missionPlan: null,
        trajectoryPoints: [],
        error: {
          message: validation.message,
          suggestion: validation.suggestion,
          timestamp: Date.now(),
        },
      };
    }

    const plan = planMission(initialState, waypoints, chief, options);

    const trajectory = generateMissionTrajectory(
      plan,
      chief,
      initialPosition,
      [0, 0, 0],
      options,
      SCENARIOS[scenario].trajectoryPointsPerLeg
    );

    return { missionPlan: plan, trajectoryPoints: trajectory, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Mission planning failed';
    return {
      missionPlan: null,
      trajectoryPoints: [],
      error: {
        message: errorMessage,
        timestamp: Date.now(),
      },
    };
  }
}

/** Incremental replanning for waypoint updates - reuses unchanged legs */
export function computeMissionIncremental(
  existingPlan: MissionPlan | null,
  modifiedIndex: number,
  waypoints: Waypoint[],
  chief: ClassicalOrbitalElements,
  initialPosition: Vector3,
  includeJ2: boolean,
  includeDrag: boolean,
  daDotDrag: number,
  dexDotDrag: number,
  deyDotDrag: number,
  scenario: ScenarioKey
): ComputeMissionResult {
  // Fall back to full replan if no existing plan or modifying first waypoint
  if (!existingPlan || modifiedIndex === 0) {
    return computeMission(
      waypoints,
      chief,
      initialPosition,
      includeJ2,
      includeDrag,
      daDotDrag,
      dexDotDrag,
      deyDotDrag,
      scenario
    );
  }

  if (waypoints.length === 0) {
    return { missionPlan: null, trajectoryPoints: [], error: null };
  }

  const initialState: RelativeState = {
    position: initialPosition,
    velocity: [0, 0, 0],
  };

  try {
    const isNearCircular = chief.eccentricity < ECCENTRICITY_THRESHOLD;
    const dragConfig: DragConfig = isNearCircular
      ? { type: 'arbitrary', daDotDrag, dexDotDrag, deyDotDrag }
      : { type: 'eccentric', daDotDrag };

    const options = {
      includeJ2,
      includeDrag,
      dragConfig,
    };

    const validation = validateTargetingConfig(chief, options);
    if (!validation.valid) {
      return {
        missionPlan: null,
        trajectoryPoints: [],
        error: {
          message: validation.message,
          suggestion: validation.suggestion,
          timestamp: Date.now(),
        },
      };
    }

    // Use incremental replanning - reuses legs before modifiedIndex
    const plan = replanFromWaypoint(
      existingPlan,
      modifiedIndex,
      waypoints,
      chief,
      initialState,
      options
    );

    const trajectory = generateMissionTrajectory(
      plan,
      chief,
      initialPosition,
      [0, 0, 0],
      options,
      SCENARIOS[scenario].trajectoryPointsPerLeg
    );

    return { missionPlan: plan, trajectoryPoints: trajectory, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Incremental planning failed';
    return {
      missionPlan: null,
      trajectoryPoints: [],
      error: {
        message: errorMessage,
        timestamp: Date.now(),
      },
    };
  }
}
