
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, FlatList, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import i18n from '../../infrastructure/i18n/i18n';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { CURRENCIES, Currency } from '../constants/currencies';
import { ScreenBackground } from '../components/ScreenBackground';

export const UserScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [langModalVisible, setLangModalVisible] = React.useState(false);
    
    // Currency Modal State
    const [currencyModalVisible, setCurrencyModalVisible] = React.useState(false);
    const [currencySearch, setCurrencySearch] = React.useState('');

    const insets = useSafeAreaInsets();
    const { isPro, downgrade, upgrade } = useSubscriptionStore();
    const { currencyCode, setCurrency } = useSettingsStore();

    const handleLanguageChange = async (lang: string) => {
        await i18n.changeLanguage(lang);
        await AsyncStorage.setItem('user-language', lang);
        setLangModalVisible(false);
    };

    const handleCurrencyChange = (code: string) => {
        setCurrency(code);
        setCurrencyModalVisible(false);
    };

    const filteredCurrencies = CURRENCIES.filter(c => 
        c.name.toLowerCase().includes(currencySearch.toLowerCase()) || 
        c.code.toLowerCase().includes(currencySearch.toLowerCase())
    );

    const LANGUAGES = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', label: 'Português', flag: '🇧🇷' },
        { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
    ];

    const handleManageSubscription = () => {
        if (!isPro) {
            router.push('/paywall');
        } else {
            // For mock purposes, allow downgrade (unsubscribe)
            Alert.alert(
                t('profile.manage'),
                t('profile.subscription'),
                [
                    { text: t('common.cancel'), style: "cancel" },
                    { text: t('common.comingSoon'), style: "destructive", onPress: downgrade }
                ]
            );
        }
    };

    const renderProfileContent = () => (
        <>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
            </View>
            <View>
                <Text style={[styles.userName, isPro && { color: '#000' }]}>User</Text>
                <View style={[styles.badge, !isPro && { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.badgeText, !isPro && { color: theme.colors.text.secondary }]}>
                        {isPro ? t('profile.proMember') : t('profile.freePlan')}
                    </Text>
                </View>
            </View>
            {!isPro && (
                <TouchableOpacity style={styles.upgradeMiniButton} onPress={() => router.push('/paywall')}>
                    <Text style={styles.upgradeMiniText}>{t('profile.upgrade')}</Text>
                </TouchableOpacity>
            )}
        </>
    );

    const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode);

    return (
        <ScreenBackground preset="immersive" style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { marginTop: insets.top + theme.spacing.m }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                     <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                {isPro ? (
                    <LinearGradient
                        colors={[theme.colors.primary, '#059669']}
                        style={styles.profileCard}
                    >
                        {renderProfileContent()}
                    </LinearGradient>
                ) : (
                    <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                        {renderProfileContent()}
                    </View>
                )}

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
                    
                    <TouchableOpacity style={styles.row} onPress={() => Alert.alert(t('common.comingSoon'), t('common.themeComingSoon'))}>
                        <Text style={styles.rowLabel}>{t('profile.appearance')}</Text>
                        <Text style={styles.rowValue}>Dark Mode 🌙</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => setCurrencyModalVisible(true)}>
                        <Text style={styles.rowLabel}>{t('profile.currency')}</Text>
                        <Text style={styles.rowValue}>{selectedCurrency ? `${selectedCurrency.code} (${selectedCurrency.symbol})` : currencyCode}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => setLangModalVisible(true)}>
                        <Text style={styles.rowLabel}>{t('profile.language')}</Text> 
                        <Text style={styles.rowValue}>
                            {(() => {
                                const selected = LANGUAGES.find(l => l.code === i18n.language);
                                return selected ? `${selected.flag} ${selected.label}` : i18n.language.toUpperCase();
                            })()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Subscription Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('profile.subscription')}</Text>
                    <TouchableOpacity style={styles.row} onPress={handleManageSubscription}>
                        <Text style={styles.rowLabel}>{t('profile.plan')}</Text>
                        <Text style={[styles.rowValue, { color: isPro ? theme.colors.primary : theme.colors.text.secondary }]}>
                            {isPro ? t('profile.lifetimePro') : t('profile.freeTier')}
                        </Text>
                    </TouchableOpacity>
                </View>

                 <View style={styles.footer}>
                    <Text style={styles.versionText}>{t('common.version')} 1.0.0</Text>
                 </View>
            </ScrollView>

            {/* Language Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={langModalVisible}
                onRequestClose={() => setLangModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('profile.language')}</Text>
                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={item => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.langOption, i18n.language === item.code && styles.langOptionSelected]}
                                    onPress={() => handleLanguageChange(item.code)}
                                >
                                    <Text style={[styles.langText, i18n.language === item.code && styles.langTextSelected]}>
                                        {item.flag}  {item.label}
                                    </Text>
                                    {i18n.language === item.code && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Currency Modal */}
             <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalFullOverlay}>
                     <View style={[styles.modalFullContent, { paddingTop: insets.top + theme.spacing.m }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{t('profile.currency')}</Text>
                            <View style={{ width: 60 }} />
                        </View>
                        
                        <View style={styles.searchContainer}>
                             <Text style={styles.searchIcon}>🔍</Text>
                             <TextInput 
                                style={styles.searchInput}
                                placeholder="Search currency..."
                                placeholderTextColor={theme.colors.text.muted}
                                value={currencySearch}
                                onChangeText={setCurrencySearch}
                                autoCorrect={false}
                             />
                        </View>

                        <FlatList
                            data={filteredCurrencies}
                            keyExtractor={item => item.code}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.currencyOption, currencyCode === item.code && styles.langOptionSelected]}
                                    onPress={() => handleCurrencyChange(item.code)}
                                >
                                    <View style={styles.currencyInfo}>
                                        <Text style={styles.currencyFlag}>{item.flag}</Text>
                                        <View>
                                            <Text style={[styles.currencyCode, currencyCode === item.code && styles.langTextSelected]}>
                                                {item.code}
                                            </Text>
                                            <Text style={styles.currencyName}>{item.name}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.currencyRight}>
                                         <Text style={styles.currencySymbol}>{item.symbol}</Text>
                                         {currencyCode === item.code && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

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
        paddingBottom: 100
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        gap: theme.spacing.m,
        borderWidth: StyleSheet.hairlineWidth,
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
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        maxHeight: '60%',
        width: '100%',
    },
    modalTitle: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    langOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    langOptionSelected: {
        backgroundColor: theme.colors.surfaceHighlight,
    },
    langText: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
    langTextSelected: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    checkmark: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Full Screen Modal for Currencies
    modalFullOverlay: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalFullContent: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.m,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    modalCloseButton: {
        padding: theme.spacing.s,
    },
    modalCloseText: {
        color: theme.colors.primary,
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: theme.spacing.s,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        height: 40,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    currencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    currencyFlag: {
        fontSize: 24,
    },
    currencyCode: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    currencyName: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    currencyRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    currencySymbol: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        fontFamily: theme.typography.mono.fontFamily,
    }
});
