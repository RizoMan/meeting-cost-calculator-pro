
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialState {
  hasSeenTutorial: boolean;
  isOpen: boolean;
  hasHydrated: boolean;
  
  setHasHydrated: (state: boolean) => void;
  
  completeTutorial: () => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  resetTutorial: () => void; // For testing/debugging
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      hasSeenTutorial: false,
      isOpen: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      completeTutorial: () => set({ hasSeenTutorial: true, isOpen: false }),
      openTutorial: () => set({ isOpen: true }),
      closeTutorial: () => set({ isOpen: false }),
      resetTutorial: () => set({ hasSeenTutorial: false, isOpen: true }),
    }),
    {
      name: 'tutorial-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
