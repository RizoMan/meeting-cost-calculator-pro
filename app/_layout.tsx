import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/presentation/theme/theme';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../src/infrastructure/i18n/i18n'; // Initialize i18n on app start

import { TutorialOverlay } from '../src/presentation/components/tutorial/TutorialOverlay';
import { useTutorialStore } from '../src/presentation/state/useTutorialStore';

export default function Layout() {
  const { hasHydrated, hasSeenTutorial, openTutorial } = useTutorialStore();

  useEffect(() => {
    if (hasHydrated && !hasSeenTutorial) {
      openTutorial();
    }
  }, [hasHydrated, hasSeenTutorial]);
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Hide the bottom navigation bar and make it transparent for gestures
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setBackgroundColorAsync("#00000000"); // Transparent
    }

    // Load persisted language
    const loadLanguage = async () => {
       try {
          const savedLang = await AsyncStorage.getItem('user-language');
          if (savedLang) {
             i18n.changeLanguage(savedLang);
          }
       } catch (e) {
          console.error("Failed to load language", e);
       }
    };
    loadLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false, // Hide the top header globally
          contentStyle: {
            backgroundColor: theme.colors.background,
          }
        }}
      />
      <StatusBar style="light" hidden={false} translucent={true} backgroundColor="transparent" /> 
      <TutorialOverlay />
    </SafeAreaProvider>
  );
}
