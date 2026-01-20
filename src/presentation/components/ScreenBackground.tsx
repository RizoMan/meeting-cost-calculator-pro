import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

type BackgroundPreset = 'standard' | 'immersive';

interface ScreenBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  preset?: BackgroundPreset;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ 
  children, 
  style, 
  preset = 'standard' 
}) => {
  // Strategy to avoid banding: 
  // 1. Extend gradient beyond visible area (y: 1.5) to "stretch" the color steps.
  // 2. Use distinct enough end color.
  
  // Standard: Black -> Zinc 950 (Theme Background)
  let colors = ['#000000', theme.colors.background]; 
  
  if (preset === 'immersive') {
      // For Paywall/Important screens: Black -> Deep Gray/Blue hint
      colors = ['#000000', '#111827']; 
  }

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1.5 }} // Smooths transition by stretching it out
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
