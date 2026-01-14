import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { Meeting } from '../../domain/entities/Meeting';
import { MeetingRepositoryImpl } from '../../infrastructure/repositories/MeetingRepositoryImpl';
import { useSubscriptionStore } from '../state/useSubscriptionStore';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HistoryScreen = () => {
  const router = useRouter();
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
      // Sort by start time descending (newest first)
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
  const displayedMeetings = isPro ? meetings : meetings.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown Date';
    return new Date(date).toLocaleDateString('en-US', {
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
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View>
            <Text style={styles.label}>Total Cost</Text>
            <Text style={[styles.costText, { textShadowColor: theme.colors.primaryGlow, textShadowRadius: 8 }]}>
              {formatCurrency(item.accumulatedCost)}
            </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.durationText}>{formatDuration(item.elapsedSeconds)}</Text>
        </View>
      </View>

      <Text style={styles.participantsText}>
        {item.participants.length} Participant{item.participants.length !== 1 ? 's' : ''}
      </Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.m }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meeting History</Text>
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
                    <Text style={styles.upgradeTitle}>View Full History</Text>
                    <Text style={styles.upgradeDesc}>Upgrade to Pro to see all past meetings.</Text>
                    <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/paywall')}>
                        <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
                    </TouchableOpacity>
                </View>
            ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meetings recorded yet.</Text>
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
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
    gap: theme.spacing.m,
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
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4, // Shadow for Android
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Primary/Emerald low opacity
  },
  statusIncomplete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Danger/Red low opacity
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
  }
});
