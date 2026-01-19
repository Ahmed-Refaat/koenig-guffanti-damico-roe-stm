import { create } from 'zustand';

// ============================================================================
// Store Types
// ============================================================================

interface SimulationState {
  /** Current simulation time in seconds from mission start */
  time: number;
  /** Whether simulation is playing */
  playing: boolean;
  /** Playback speed multiplier (1, 2, 5, 10) */
  speed: number;
}

interface SimulationActions {
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Reset to beginning */
  reset: () => void;
  /** Set playback speed */
  setSpeed: (speed: number) => void;
  /** Set time directly (for scrubbing) */
  setTime: (time: number) => void;
  /** Advance time by delta (called from animation loop) */
  tick: (dt: number, totalTime: number) => void;
}

type SimulationStore = SimulationState & SimulationActions;

// ============================================================================
// Store
// ============================================================================

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  time: 0,
  playing: false,
  speed: 1,

  // Actions
  play: () => set({ playing: true }),

  pause: () => set({ playing: false }),

  reset: () =>
    set({
      time: 0,
      playing: false,
      speed: 1,
    }),

  setSpeed: (speed) => set({ speed }),

  setTime: (time) => {
    const clampedTime = Math.max(0, time);
    set({ time: clampedTime });
  },

  tick: (dt, totalTime) => {
    const state = get();
    if (!state.playing) return;

    const newTime = state.time + dt * state.speed;

    // Auto-pause at end
    if (newTime >= totalTime) {
      set({
        time: totalTime,
        playing: false,
      });
      return;
    }

    set({ time: newTime });
  },
}));
