import { create } from 'zustand';

interface UIState {
  activeTab: string;
  showAddWineFAB: boolean;
  setActiveTab: (tab: string) => void;
  setShowAddWineFAB: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'index',
  showAddWineFAB: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowAddWineFAB: (showAddWineFAB) => set({ showAddWineFAB }),
}));
