
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENCIES, Currency } from '../constants/currencies';

interface SettingsState {
  currencyCode: string;
  setCurrency: (code: string) => void;
  getCurrencySymbol: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currencyCode: 'USD',
      setCurrency: (code: string) => set({ currencyCode: code }),
      getCurrencySymbol: () => {
        const currency = CURRENCIES.find(c => c.code === get().currencyCode);
        return currency ? currency.symbol : '$';
      }
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
