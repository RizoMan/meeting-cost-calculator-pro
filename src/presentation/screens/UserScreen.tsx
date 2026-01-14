
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useSubscriptionStore } from '../state/useSubscriptionStore';

export const UserScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isPro, downgrade, upgrade } = useSubscriptionStore();

    const handleManageSubscription = () => {
        if (!isPro) {
            router.push('/paywall');
        } else {
            // For mock purposes, allow downgrade (unsubscribe)
            Alert.alert(
                "Manage Subscription",
                "You are currently a Pro member.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Unsubscribe (Debug)", style: "destructive", onPress: downgrade }
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={[theme.colors.background, '#1a1a1a']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={[styles.header, { marginTop: insets.top + theme.spacing.m }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                     <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <LinearGradient
                    colors={isPro ? [theme.colors.primary, '#059669'] : [theme.colors.surface, theme.colors.surfaceHighlight]}
                    style={styles.profileCard}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <View>
                        <Text style={[styles.userName, isPro && { color: '#000' }]}>User</Text>
                        <View style={[styles.badge, !isPro && { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.badgeText, !isPro && { color: theme.colors.text.secondary }]}>
                                {isPro ? '✨ PRO MEMBER' : 'FREE PLAN'}
                            </Text>
                        </View>
                    </View>
                    {!isPro && (
                        <TouchableOpacity style={styles.upgradeMiniButton} onPress={() => router.push('/paywall')}>
                            <Text style={styles.upgradeMiniText}>UPGRADE</Text>
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    
                    <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Coming Soon", "Theme switching coming soon!")}>
                        <Text style={styles.rowLabel}>Appearance</Text>
                        <Text style={styles.rowValue}>Dark Mode 🌙</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Coming Soon", "Multi-currency support coming soon!")}>
                        <Text style={styles.rowLabel}>Currency</Text>
                        <Text style={styles.rowValue}>USD ($)</Text>
                    </TouchableOpacity>
                </View>

                {/* Subscription Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription</Text>
                    <TouchableOpacity style={styles.row} onPress={handleManageSubscription}>
                        <Text style={styles.rowLabel}>Plan</Text>
                        <Text style={[styles.rowValue, { color: isPro ? theme.colors.primary : theme.colors.text.secondary }]}>
                            {isPro ? 'Lifetime Pro' : 'Free Tier'}
                        </Text>
                    </TouchableOpacity>
                </View>

                 <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                 </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
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
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: theme.spacing.m,
    },
    content: {
        padding: theme.spacing.l,
        gap: theme.spacing.xl,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        gap: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 30,
    },
    userName: {
        color: theme.colors.text.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    upgradeMiniButton: {
        marginLeft: 'auto',
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    upgradeMiniText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    section: {
        gap: 1, // for separator effect if we used backgrounds, but here just spacing
    },
    sectionTitle: {
        color: theme.colors.text.muted,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.s,
        marginLeft: theme.spacing.s,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.s,
        marginBottom: theme.spacing.s,
    },
    rowLabel: {
        color: theme.colors.text.primary,
        fontSize: 16,
    },
    rowValue: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
    footer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    versionText: {
        color: theme.colors.text.muted,
        fontSize: 14,
    }
});
