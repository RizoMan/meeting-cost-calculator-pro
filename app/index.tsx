import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '../src/presentation/theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ImageBackground 
      source={require('../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
            style={[styles.profileButton, { top: insets.top + theme.spacing.m }]} 
            onPress={() => router.push('/profile')}
        >
            <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('landing.title')}</Text>
          <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/meeting/setup')}
          >
            <Text style={styles.ctaText}>{t('landing.start')}</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/meeting/history')}
              >
                <Text style={styles.secondaryButtonText}>{t('landing.history')}</Text>
              </TouchableOpacity>
              


              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/meeting/analytics')}
              >
                <Text style={styles.secondaryButtonText}>{t('landing.analytics')}</Text>
              </TouchableOpacity>



              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                   const { openTutorial } = require('../src/presentation/state/useTutorialStore').useTutorialStore.getState();
                   openTutorial();
                }}
              >
                <Text style={styles.secondaryButtonText}>{t('landing.tutorial')}</Text>
              </TouchableOpacity>
              


              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/tools/currency-converter')}
              >
                <Text style={styles.secondaryButtonText}>💱 {t('landing.converter') || 'Converter'}</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.7)', // 70% opacity dark overlay to ensure readability
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 6,
    marginBottom: theme.spacing.xxl,
    textShadowColor: theme.colors.primaryGlow,
    textShadowRadius: 10,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl, // Reduced horizontal padding
    borderRadius: theme.borderRadius.full,
    width: 'auto', // Auto width instead of 100%
    minWidth: 200, // Minimum width for touch target
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 }, // Slightly smaller shadow
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: '#000',
    fontSize: 16, // Slightly smaller text
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryActions: {
      flexDirection: 'row',
      marginTop: theme.spacing.xl,
      alignItems: 'center',
      flexWrap: 'wrap', // Allow wrapping
      justifyContent: 'center', // Center items
      gap: theme.spacing.m, // Use gap instead of dividers
  },
  secondaryButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },
  secondaryButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
      width: 1,
      height: 16,
      backgroundColor: theme.colors.text.muted,
      marginHorizontal: theme.spacing.s,
  },
  profileButton: {
      position: 'absolute',
      right: theme.spacing.l,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  profileIcon: {
      fontSize: 20,
  }
});
