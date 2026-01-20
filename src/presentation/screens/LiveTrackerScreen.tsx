
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMeetingStore } from '../state/useMeetingStore';
import { useRouter, Stack } from 'expo-router';
import { theme } from '../theme/theme';
import { ScreenBackground } from '../components/ScreenBackground';
import { useSettingsStore } from '../state/useSettingsStore';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LiveTrackerScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentMeeting, startMeeting, pauseMeeting, stopMeeting, tick } = useMeetingStore();
  const { accumulatedCost, elapsedSeconds, status, participants, expectedDurationMinutes } = currentMeeting;
  const { currencyCode } = useSettingsStore();

  const progress = expectedDurationMinutes ? (elapsedSeconds / 60) / expectedDurationMinutes : 0;
  const isOvertime = progress > 1;

  const handleStop = () => {
      Alert.alert(
          t('tracker.confirmStopTitle'),
          t('tracker.confirmStopMessage'),
          [
              { text: t('common.cancel'), style: 'cancel' },
              { 
                  text: t('tracker.finish'), 
                  style: 'destructive',
                  onPress: () => stopMeeting() 
              }
          ]
      );
  };

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
      currency: currencyCode,
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
    <ScreenBackground
      preset="standard"
      style={[styles.container, { paddingTop: insets.top + theme.spacing.l }]}
    >
      <Stack.Screen options={{ title: t('tracker.title'), headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: '#fff' }} />
      
      <View style={styles.header}>
         {status === 'completed' && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </TouchableOpacity>
         )}
         <Text style={styles.statusText}>{status === 'active' ? t('tracker.status.active') : status === 'paused' ? t('tracker.status.paused') : t('tracker.meetingFinished')}</Text>
      </View>

      <View style={styles.mainDisplay}>
        <Text style={styles.label}>{status === 'completed' ? t('tracker.finalCost') : t('tracker.currentCost')}</Text>
        <Text style={[styles.costText, status === 'completed' && { color: theme.colors.success }]}>{formatMoney(accumulatedCost)}</Text>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>

        {/* Duration Progress Bar (Hide if completed) */}
        {!!expectedDurationMinutes && status !== 'completed' && (
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { 
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: isOvertime ? theme.colors.danger : theme.colors.success 
                            }
                        ]} 
                    />
                </View>
                <Text style={[styles.progressText, isOvertime && { color: theme.colors.danger }]}>
                    {isOvertime 
                        ? `${t('tracker.overtime')}: ${Math.floor((elapsedSeconds/60) - expectedDurationMinutes)}m`
                        : `${t('tracker.remaining')}: ${Math.floor(expectedDurationMinutes - (elapsedSeconds/60))}m`
                    }
                </Text>
            </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('tracker.participants')}</Text>
          <Text style={styles.statValue}>{participants.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('tracker.burnRate')}</Text>
          <Text style={styles.statValue}>
            {formatMoney(participants.reduce((sum, p) => sum + p.hourlyRate, 0))}
          </Text>
        </View>
      </View>

      {/* Controls - Hide when completed, show only Back/Exit */}
      <View style={styles.controls}>
        {status !== 'completed' ? (
            <>
                {status === 'active' ? (
                <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={pauseMeeting}>
                    <Text style={styles.buttonText}>{t('tracker.pause')}</Text>
                </TouchableOpacity>
                ) : (
                <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startMeeting}>
                    <Text style={styles.buttonText}>{status === 'idle' ? t('tracker.resume') : t('tracker.resume')}</Text>
                </TouchableOpacity>
                )}
                
                <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
                <Text style={styles.buttonText}>{t('tracker.stop')}</Text>
                </TouchableOpacity>
            </>
        ) : (
             <TouchableOpacity style={[styles.button, styles.startButton, { width: '100%' }]} onPress={() => router.back()}>
                <Text style={styles.buttonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
        )}
      </View>
    </ScreenBackground>
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
    // zIndex: 10,
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
  progressContainer: {
      width: '80%',
      marginTop: 20,
      alignItems: 'center',
  },
  progressBarBackground: {
      width: '100%',
      height: 6,
      backgroundColor: theme.colors.surface,
      borderRadius: 3,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 3,
  },
  progressText: {
      color: theme.colors.text.secondary,
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
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
    borderWidth: StyleSheet.hairlineWidth,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

