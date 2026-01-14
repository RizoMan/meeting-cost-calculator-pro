
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, Platform, Animated } from 'react-native';
import { theme } from '../../theme/theme';
import { useTutorialStore } from '../../state/useTutorialStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Track Meeting Costs',
    description: 'See exactly how much your meetings adhere to the budget in real-time.',
    emoji: '💸',
    gradient: ['#10B981', '#059669'] as const,
  },
  {
    id: '2',
    title: 'Save Teams',
    description: 'Create and save participant groups for quick setup in daily standups.',
    emoji: '👥',
    gradient: ['#3B82F6', '#2563EB'] as const,
  },
  {
    id: '3',
    title: 'Analyze History',
    description: 'Review past meeting costs and identify trends to optimize efficiency.',
    emoji: '📊',
    gradient: ['#F59E0B', '#D97706'] as const,
  },
];

export const TutorialOverlay = () => {
  const { isOpen, hasSeenTutorial, completeTutorial, closeTutorial, openTutorial } = useTutorialStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  
  // Animation for fade in/out
  const opacity = useRef(new Animated.Value(0)).current;

  // Initial check (optional, store handles persistence but we might want to trigger it on mount if not seen)
  useEffect(() => {
    // If we haven't seen tutorial, open it automatically.
    // However, persist might take a moment to rehydrate. 
    // Zustand persist is usually sync if using localStorage, but async with AsyncStorage.
    // We'll rely on the store's state. But we might need to trigger generic "open if not seen" logic once hydration is done. 
    // For now, let's assume if hasSeenTutorial is false, we want to show it.
    
    // Actually, createJSONStorage with AsyncStorage is async. 
    // Zustand persist has onRehydrateStorage. 
    // But simpler: checking in layout effect or just render.
    
    // We will check in a useEffect here? No, better to do it in the store or a top level component.
    // But since this IS the top level component for tutorial...
    
    const checkStatus = async () => {
        // Just let the store persist handle it. 
        // If hasSeenTutorial is false (default), isOpen might be false.
        // We need logic: if (!hasSeenTutorial) openTutorial();
        // But we don't want to flicker.
        
        // Let's add a small timeout to allow hydration or check `useTutorialStore.persist.hasHydrated()`
        // For simplicity, we'll trigger it in layout if not seen.
    };
  }, []);

  // Sync visibility with animation
  useEffect(() => {
    if (isOpen) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  // Determine if we should render (to avoid blocking touches when hidden)
  if (!isOpen && !hasSeenTutorial) {
      // If never seen, we force open? 
      // Handled by parent or store initialization. 
      // Let's assume the store logic will set isOpen = true if hasSeenTutorial is false initially?
      // No, the store default is isOpen: false.
      // We should probably set isOpen = true if !hasSeenTutorial in a useEffect.
  }

  useEffect(() => {
     // A hook to auto-open if not seen
     // We need to know if hydration finished. 
     const unsub = useTutorialStore.persist.onFinishHydration((state) => {
         if (!state.hasSeenTutorial) {
             openTutorial();
         }
     });
     return () => {
         // unsub(); // implementation detail of zustand persist, might not return unsub
     };
  }, []);
  
  // Workaround for hydration check if needed, but onFinishHydration is in options.
  // We can just rely on the component reacting to store changes. 
  // We'll inject the onFinishHydration in the store definition or just use a simple effect here that might run once.

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
      completeTutorial();
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
    return (
      <View style={[styles.slide, { width, height }]}>
        <LinearGradient
            colors={item.gradient}
            style={styles.imagePlaceholder}
        >
            <Text style={styles.emoji}>{item.emoji}</Text>
        </LinearGradient>
        
        <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeTutorial}>
      <View style={styles.container}>
        <View style={[styles.background, { backgroundColor: theme.colors.background }]} />
        
        <TouchableOpacity style={[styles.skipButton, { top: insets.top + 10 }]} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
             const cx = e.nativeEvent.contentOffset.x;
             setCurrentIndex(Math.round(cx / width));
          }}
          keyExtractor={item => item.id}
          bounces={false}
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.pagination}>
                {SLIDES.map((_, i) => (
                    <View 
                        key={i} 
                        style={[
                            styles.dot, 
                            i === currentIndex && styles.activeDot,
                            { backgroundColor: i === currentIndex ? theme.colors.primary : theme.colors.surfaceHighlight }
                        ]} 
                    />
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                </Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  background: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.95,
  },
  slide: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
      width: 200,
      height: 200,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
  },
  emoji: {
      fontSize: 80,
  },
  content: {
      alignItems: 'center',
      gap: theme.spacing.m,
  },
  title: {
      color: theme.colors.text.primary,
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  description: {
      color: theme.colors.text.secondary,
      fontSize: 18,
      textAlign: 'center',
      lineHeight: 26,
      maxWidth: '90%',
  },
  skipButton: {
      position: 'absolute',
      right: theme.spacing.l,
      zIndex: 10,
      padding: theme.spacing.s,
  },
  skipText: {
      color: theme.colors.text.muted,
      fontSize: 16,
      fontWeight: '600',
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.l,
      gap: theme.spacing.l,
  },
  pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
  },
  dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
  },
  activeDot: {
      width: 20,
  },
  button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.l,
      alignItems: 'center',
  },
  buttonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: 'bold',
  },
});
