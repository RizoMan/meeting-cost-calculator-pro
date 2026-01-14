
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  
  upgrade: () => Promise<void>;
  downgrade: () => void; // internal or debug
  restorePurchase: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isPro: false,
      isLoading: false,

      upgrade: async () => {
        set({ isLoading: true });
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        set({ isPro: true, isLoading: false });
      },

      downgrade: () => set({ isPro: false }),

      restorePurchase: async () => {
         set({ isLoading: true });
         // Mock restore
         await new Promise(resolve => setTimeout(resolve, 1500));
         // Logic: simulate checking purchases. For now, we assume user owns it if we are testing.
         // But let's set it to true for demo purposes if they click restore.
         set({ isPro: true, isLoading: false });
         return true;
      }
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
