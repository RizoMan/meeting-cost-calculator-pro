
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { ScreenBackground } from '../components/ScreenBackground';

const BENEFITS = [
    { emoji: '🧠', title: 'Smart AI Analysis', desc: 'Get deep insights into your meeting costs.' },
    { emoji: '♾️', title: 'Unlimited History', desc: 'Store and access all your past meetings.' },
    { emoji: '🎨', title: 'Premium Themes', desc: 'Customize the app look (Coming Soon).' },
];

export const PaywallScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { upgrade, restorePurchase, isLoading, isPro } = useSubscriptionStore();

    const handlePurchase = async () => {
        try {
            await upgrade();
            Alert.alert(t('common.success'), t('paywall.successMsg'), [
                { text: t('common.ok'), onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert(t('common.error'), t('paywall.purchaseFailed'));
        }
    };

    const handleRestore = async () => {
        try {
            await restorePurchase();
            Alert.alert(t('paywall.restoredTitle'), t('paywall.restoredMsg'), [
                 { text: t('common.ok'), onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert(t('common.error'), t('paywall.verifyError'));
        }
    };

    return (
        <ScreenBackground preset="immersive" style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { marginTop: insets.top + theme.spacing.m }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                     <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={[theme.colors.primary, '#059669']}
                        style={styles.iconContainer}
                    >
                        <Text style={styles.heroIcon}>👑</Text>
                    </LinearGradient>
                    <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
                    <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
                </View>

                <View style={styles.benefitsContainer}>
                        <View style={styles.benefitRow}>
                            <Text style={styles.benefitEmoji}>🧠</Text>
                            <View>
                                <Text style={styles.benefitTitle}>{t('paywall.benefit1Title')}</Text>
                                <Text style={styles.benefitDesc}>{t('paywall.benefit1Desc')}</Text>
                            </View>
                        </View>
                        <View style={styles.benefitRow}>
                            <Text style={styles.benefitEmoji}>♾️</Text>
                            <View>
                                <Text style={styles.benefitTitle}>{t('paywall.benefit2Title')}</Text>
                                <Text style={styles.benefitDesc}>{t('paywall.benefit2Desc')}</Text>
                            </View>
                        </View>
                        <View style={styles.benefitRow}>
                            <Text style={styles.benefitEmoji}>🎨</Text>
                            <View>
                                <Text style={styles.benefitTitle}>{t('paywall.benefit3Title')}</Text>
                                <Text style={styles.benefitDesc}>{t('paywall.benefit3Desc')}</Text>
                            </View>
                        </View>
                </View>

                {/* Pricing Card */}
                <View style={styles.pricingCard}>
                     <Text style={styles.planName}>{t('paywall.lifetime')}</Text>
                     <View style={styles.priceRow}>
                         <Text style={styles.price}>$9.99</Text>
                         <Text style={styles.frequency}>{t('paywall.once')}</Text>
                     </View>
                     <Text style={styles.guarantee}>{t('paywall.noSub')}</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.l }]}>
                <TouchableOpacity 
                    style={[styles.purchaseButton, isLoading && { opacity: 0.7 }]} 
                    onPress={handlePurchase}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.purchaseText}>{t('paywall.unlock')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
                    <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
                </TouchableOpacity>
            </View>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    header: {
        paddingHorizontal: theme.spacing.l,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.l,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    heroIcon: {
        fontSize: 40,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 280,
    },
    benefitsContainer: {
        width: '100%',
        marginBottom: theme.spacing.xxl,
        gap: theme.spacing.l,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    benefitEmoji: {
        fontSize: 24,
    },
    benefitTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    benefitDesc: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    pricingCard: {
        width: '100%',
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.primary,
         backgroundColor: 'rgba(16, 185, 129, 0.05)',
        alignItems: 'center',
    },
    planName: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.s,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: theme.spacing.s,
    },
    price: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    frequency: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
    guarantee: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    footer: {
        padding: theme.spacing.l,
        gap: theme.spacing.l,
    },
    purchaseButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    purchaseText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    restoreText: {
        color: theme.colors.text.secondary,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
