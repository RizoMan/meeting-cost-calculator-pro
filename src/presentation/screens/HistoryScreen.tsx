
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { Meeting } from '../../domain/entities/Meeting';
import { MeetingRepositoryImpl } from '../../infrastructure/repositories/MeetingRepositoryImpl';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { useSettingsStore } from '../state/useSettingsStore';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExportService } from '../../application/services/ExportService';
import { Alert } from 'react-native';



export const HistoryScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const repo = new MeetingRepositoryImpl();
      const data = await repo.getAll();
      const sorted = data.sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
      });
      setMeetings(sorted);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { isPro } = useSubscriptionStore();
  const { currencyCode, getCurrencySymbol } = useSettingsStore();

  const displayedMeetings = isPro ? meetings : meetings.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2
    }).format(amount);
  };

  const handleExportPDF = async (meeting: Meeting) => {
      try {
          const uri = await ExportService.generateMeetingPDF(meeting, getCurrencySymbol(), currencyCode, t, i18n.language);
          await ExportService.shareFile(uri);
      } catch (error) {
          Alert.alert(t('common.error'), t('common.exportError') || 'Failed to export PDF');
      }
  };

  const handleExportCSV = async () => {
      if (meetings.length === 0) return;
      try {
          const uri = await ExportService.generateHistoryCSV(meetings, t, i18n.language);
          await ExportService.shareFile(uri);
      } catch (error) {
          Alert.alert(t('common.error'), t('common.exportError') || 'Failed to export CSV');
      }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return t('common.unknownDate');
    return new Date(date).toLocaleDateString(i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const renderItem = ({ item }: { item: Meeting }) => (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
        <View style={[styles.statusBadge, item.status === 'completed' ? styles.statusCompleted : styles.statusIncomplete]}>
          <Text style={styles.statusText}>{item.status === 'completed' ? t('tracker.status.completed') : t('tracker.status.active')}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View>
            <Text style={styles.label}>{t('history.title')}</Text>
            <Text style={styles.label}>{t('tracker.currentCost')}</Text>
            <Text style={[styles.costText, { textShadowColor: theme.colors.primaryGlow, textShadowRadius: 8 }]}>
              {formatCurrency(item.accumulatedCost)}
            </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>{t('history.duration')}</Text>
            <Text style={styles.durationText}>{formatDuration(item.elapsedSeconds)}</Text>
        </View>
      </View>

      <Text style={styles.participantsText}>
        {item.participants.length} {t('tracker.participants')}
      </Text>

      <TouchableOpacity 
        style={styles.exportButton}
        onPress={() => handleExportPDF(item)}
      >
        <Text style={styles.exportButtonText}>📄 {t('common.exportPDF') || 'Export PDF'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.m }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('history.title')}</Text>
        </View>
        
        {isPro && meetings.length > 0 && (
            <TouchableOpacity onPress={handleExportCSV} style={styles.csvButton}>
                <Text style={styles.csvButtonText}>📊 CSV</Text>
            </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayedMeetings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadHistory}
        ListFooterComponent={
            !isPro && meetings.length > 3 ? (
                <View style={styles.upgradeCard}>
                    <Text style={styles.upgradeTitle}>{t('paywall.benefit2Desc')}...</Text>
                    <Text style={styles.upgradeDesc}>{t('paywall.unlock')}</Text>
                    <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/paywall')}>
                        <Text style={styles.upgradeBtnText}>{t('profile.upgrade')}</Text>
                    </TouchableOpacity>
                </View>
            ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('history.noMeetings')}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  backButton: {
    padding: theme.spacing.s,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.header.fontSize,
    fontWeight: 'bold',
  },
  listContent: {
    gap: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  dateText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusIncomplete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    color: theme.colors.text.primary,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  label: {
    color: theme.colors.text.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  costText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  durationText: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: theme.typography.mono.fontFamily,
  },
  participantsText: {
    color: theme.colors.text.muted,
    fontSize: 12,
    marginTop: theme.spacing.s,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  emptyText: {
    color: theme.colors.text.muted,
    fontSize: 16,
  },
  upgradeCard: {
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
  },
  upgradeTitle: {
      color: theme.colors.text.primary,
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
  },
  upgradeDesc: {
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.m,
  },
  upgradeButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.borderRadius.full,
  },
  upgradeBtnText: {
      color: '#000',
      fontWeight: 'bold',
  },
  exportButton: {
      marginTop: theme.spacing.m,
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.s,
      alignSelf: 'flex-start',
  },
  exportButtonText: {
      color: theme.colors.text.primary,
      fontSize: 12,
      fontWeight: '600',
  },
  csvButton: {
      backgroundColor: theme.colors.surface,
      padding: 8,
      borderRadius: theme.borderRadius.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
  },
  csvButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 12,
  }
});
