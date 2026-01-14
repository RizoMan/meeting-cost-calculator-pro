import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMeetingStore } from '../state/useMeetingStore';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LiveTrackerScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentMeeting, startMeeting, pauseMeeting, stopMeeting, tick } = useMeetingStore();
  const { accumulatedCost, elapsedSeconds, status, participants } = currentMeeting;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'active') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, '#1a1a1a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + theme.spacing.l }]}
    >
      <Stack.Screen options={{ title: 'Live Meeting', headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: '#fff' }} />
      
      <View style={styles.header}>
         {status === 'completed' && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
         )}
         <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>

      <View style={styles.mainDisplay}>
        <Text style={styles.label}>Current Cost</Text>
        <Text style={styles.costText}>{formatMoney(accumulatedCost)}</Text>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Participants</Text>
          <Text style={styles.statValue}>{participants.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Burn Rate/Hr</Text>
          <Text style={styles.statValue}>
            {formatMoney(participants.reduce((sum, p) => sum + p.hourlyRate, 0))}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {status === 'active' ? (
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={pauseMeeting}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startMeeting}>
            <Text style={styles.buttonText}>{status === 'idle' ? 'Start' : 'Resume'}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopMeeting}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.m,
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: theme.spacing.s,
    zIndex: 10,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    fontWeight: '700',
    fontSize: 14,
  },
  mainDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.s,
  },
  costText: {
    color: theme.colors.primary,
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -2,
    textShadowColor: theme.colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  timerText: {
    color: theme.colors.text.muted,
    fontSize: 28,
    fontFamily: theme.typography.mono.fontFamily,
    marginTop: theme.spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.m,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    minWidth: 140,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: theme.colors.secondary,
  },
  pauseButton: {
    backgroundColor: theme.colors.warning,
  },
  stopButton: {
    backgroundColor: theme.colors.surfaceHighlight, // Muted stop for safety
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
