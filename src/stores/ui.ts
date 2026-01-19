import { create } from 'zustand';

export type SidebarTab = 'help' | 'config';

interface UIState {
  sidebarOpen: boolean;
  hudVisible: boolean;
  activeTab: SidebarTab;
  zoomScale: number;
}

interface UIActions {
  toggleSidebar: () => void;
  toggleHUD: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHudVisible: (visible: boolean) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setZoomScale: (scale: number) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  sidebarOpen: true,
  hudVisible: true,
  activeTab: 'config',
  zoomScale: 1,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleHUD: () => set((state) => ({ hudVisible: !state.hudVisible })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setHudVisible: (visible) => set({ hudVisible: visible }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setZoomScale: (scale) => set({ zoomScale: scale }),
}));
