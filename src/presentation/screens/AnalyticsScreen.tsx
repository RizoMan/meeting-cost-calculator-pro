import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { MeetingRepositoryImpl } from '../../infrastructure/repositories/MeetingRepositoryImpl';
import { AnalyticsService, DashboardStats } from '../../domain/services/AnalyticsService';
import { useSubscriptionStore } from '../state/useSubscriptionStore';

export const AnalyticsScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isPro } = useSubscriptionStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const repo = new MeetingRepositoryImpl();
            const meetings = await repo.getAll();
            const calculated = AnalyticsService.calculateStats(meetings);
            const genInsights = AnalyticsService.generateInsights(meetings);
            setStats(calculated);
            setInsights(genInsights);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.spacing.m }]}>
             <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {stats && (
                    <>
                        {/* Main KPI: Total Spent */}
                        <LinearGradient
                             colors={['#18181B', '#09090B']}
                             start={{ x: 0, y: 0 }}
                             end={{ x: 1, y: 1 }}
                             style={styles.mainCard}
                        >
                            <Text style={styles.label}>Total Spent (All Time)</Text>
                            <Text style={styles.bigNumber}>{formatCurrency(stats.totalCost)}</Text>
                        </LinearGradient>

                        <View style={styles.grid}>
                             <LinearGradient
                                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                                style={styles.gridCard}
                             >
                                <Text style={styles.smallLabel}>Meetings</Text>
                                <Text style={styles.midNumber}>{stats.meetingCount}</Text>
                             </LinearGradient>

                             <LinearGradient
                                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                                style={styles.gridCard}
                             >
                                <Text style={styles.smallLabel}>Total Time</Text>
                                <Text style={styles.midNumber}>{formatDuration(stats.totalDurationSeconds)}</Text>
                             </LinearGradient>
                        </View>

                        <LinearGradient
                             colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                             style={styles.wideCard}
                        >
                            <Text style={styles.smallLabel}>Avg. Cost per Meeting</Text>
                            <Text style={styles.midNumber}>{formatCurrency(stats.averageCost)}</Text>
                        </LinearGradient>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>AI Insights 🧠</Text>
                        </View>

                        <View style={styles.insightsContainer}>
                            {isPro ? (
                                insights.map((insight, index) => (
                                    <View key={index} style={styles.insightBox}>
                                        <Text style={styles.insightText}>{insight}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.lockedContainer}>
                                    {/* Blurred/Obscured Content Mock */}
                                    <View style={[styles.insightBox, { opacity: 0.3 }]}>
                                        <Text style={styles.insightText}>Lorem ipsum dolor sit amet, consider reducing meeting times by 15%.</Text>
                                    </View>
                                    <View style={[styles.insightBox, { opacity: 0.3 }]}>
                                        <Text style={styles.insightText}>Tuesday meetings are trending higher in cost.</Text>
                                    </View>
                                    
                                    {/* Lock Overlay */}
                                    <View style={styles.lockOverlay}>
                                        <Text style={styles.lockIcon}>🔒</Text>
                                        <Text style={styles.lockTitle}>Unlock AI Analysis</Text>
                                        <TouchableOpacity 
                                            style={styles.upgradeButton}
                                            onPress={() => router.push('/paywall')}
                                        >
                                            <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.m,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
    scrollContent: {
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.m,
    },
    mainCard: {
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    label: {
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: theme.spacing.s,
        fontSize: 12,
    },
    bigNumber: {
        color: theme.colors.text.primary,
        fontSize: 48,
        fontWeight: '800',
        textShadowColor: theme.colors.primaryGlow,
        textShadowRadius: 10,
    },
    grid: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    gridCard: {
        flex: 1,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
    },
    wideCard: {
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
    },
    smallLabel: {
        color: theme.colors.text.muted,
        fontSize: 12,
        marginBottom: 8,
    },
    midNumber: {
        color: theme.colors.text.primary,
        fontSize: 24,
        fontWeight: '700',
    },
    insightBox: {
        marginTop: theme.spacing.s,
        padding: theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    insightTitle: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    insightText: {
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    sectionHeader: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    sectionTitle: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    insightsContainer: {
        gap: theme.spacing.s,
    },
    lockedContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.m,
        gap: theme.spacing.s,
    },
    lockIcon: {
        fontSize: 32,
    },
    lockTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    upgradeButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.full,
    },
    upgradeText: {
        color: '#000',
        fontWeight: 'bold',
    }
});
