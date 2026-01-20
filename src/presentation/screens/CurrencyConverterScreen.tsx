
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme/theme';
import { ScreenBackground } from '../components/ScreenBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CURRENCIES, Currency } from '../constants/currencies';
import { LinearGradient } from 'expo-linear-gradient';

// Mock Exchange Rates (Base USD)
// In a real app, this would fetch from an API
const MOCK_RATES: Record<string, number> = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 148.12,
    'CNY': 7.19,
    'AUD': 1.52,
    'CAD': 1.35,
    'CHF': 0.88,
    'HKD': 7.82,
    'NZD': 1.63,
    'SEK': 10.45,
    'KRW': 1335.50,
    'SGD': 1.34,
    'NOK': 10.50,
    'MXN': 17.15,
    'INR': 83.03,
    'RUB': 91.50,
    'ZAR': 19.00,
    'TRY': 30.50,
    'BRL': 4.95,
    'TWD': 31.50,
    'DKK': 6.90,
    'PLN': 4.00,
    'THB': 35.50,
    'IDR': 15600.00,
    'HUF': 355.00,
    'CZK': 23.00,
    'ILS': 3.75,
    'CLP': 940.00,
    'PHP': 56.00,
    'AED': 3.67,
    'COP': 3950.00,
    'SAR': 3.75,
    'MYR': 4.75,
    'RON': 4.60,
    'VND': 24500.00,
    'ARS': 850.00,
    'NGN': 1400.00,
    'UAH': 38.00,
    'EGP': 31.00,
    'PKR': 280.00,
    'IQD': 1310.00,
    'QAR': 3.64,
    'KWD': 0.31,
    'PEN': 3.75,
    'KZT': 450.00,
    'CRC': 515.00,
    'UYU': 39.00
};

export const CurrencyConverterScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    
    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectingSide, setSelectingSide] = useState<'from' | 'to'>('from');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        convert();
    }, [amount, fromCurrency, toCurrency]);

    const convert = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) {
            setConvertedAmount(null);
            return;
        }

        // Mock Logic
        // Rate = (Target / Base) -> (Rate_To / Rate_From)
        const rateFrom = MOCK_RATES[fromCurrency] || 1;
        const rateTo = MOCK_RATES[toCurrency] || 1;
        
        // If currency not in mock, generate a random "stable" rate based on char code sum just for demo visualization consistency
        // or just default to 1:1 if unknown. Let's default to a "simulated" rate if missing.
        const effectiveRateFrom = MOCK_RATES[fromCurrency] ? rateFrom : 1;
        const effectiveRateTo = MOCK_RATES[toCurrency] ? rateTo : 1;

        const result = val * (effectiveRateTo / effectiveRateFrom);
        setConvertedAmount(result);
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const openModal = (side: 'from' | 'to') => {
        setSelectingSide(side);
        setSearchQuery('');
        setModalVisible(true);
    };

    const handleSelectCurrency = (code: string) => {
        if (selectingSide === 'from') {
            setFromCurrency(code);
        } else {
            setToCurrency(code);
        }
        setModalVisible(false);
    };

    const filteredCurrencies = CURRENCIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSymbol = (code: string) => {
        return CURRENCIES.find(c => c.code === code)?.symbol || '';
    };

    const getFlag = (code: string) => {
        return CURRENCIES.find(c => c.code === code)?.flag || '🏳️';
    };

    return (
        <ScreenBackground preset="standard" style={styles.container}>
             <Stack.Screen options={{ headerShown: false }} />
            
            <View style={[styles.header, { marginTop: insets.top + theme.spacing.m }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('converter.title') || 'Converter'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Input Card */}
                <View style={styles.card}>
                    <Text style={styles.label}>{t('converter.amount') || 'Amount'}</Text>
                    <TextInput 
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.text.muted}
                    />
                </View>

                {/* Converter Section */}
                <View style={styles.converterRow}>
                    {/* From Currency */}
                    <TouchableOpacity style={styles.currencyButton} onPress={() => openModal('from')}>
                        <Text style={styles.currencyFlag}>{getFlag(fromCurrency)}</Text>
                        <Text style={styles.currencyCode}>{fromCurrency}</Text>
                        <Text style={styles.carrot}>▼</Text>
                    </TouchableOpacity>

                    {/* Swap Button */}
                    <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                        <Text style={styles.swapIcon}>⇄</Text>
                    </TouchableOpacity>

                    {/* To Currency */}
                     <TouchableOpacity style={styles.currencyButton} onPress={() => openModal('to')}>
                        <Text style={styles.currencyFlag}>{getFlag(toCurrency)}</Text>
                        <Text style={styles.currencyCode}>{toCurrency}</Text>
                        <Text style={styles.carrot}>▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Result Display */}
                 <LinearGradient
                    colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                    style={styles.resultCard}
                 >
                    <Text style={styles.resultLabel}>
                        1 {fromCurrency} = {((MOCK_RATES[toCurrency]||1) / (MOCK_RATES[fromCurrency]||1)).toFixed(4)} {toCurrency}
                    </Text>
                    <Text style={styles.resultValue}>
                        {getSymbol(toCurrency)} {convertedAmount?.toFixed(2)}
                    </Text>
                 </LinearGradient>

                 <Text style={styles.disclaimer}>
                    {t('converter.disclaimer') || '* Exchange rates are approximate and for reference only.'}
                 </Text>

            </ScrollView>

            {/* Currency Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                     <View style={[styles.modalContent, { paddingTop: insets.top + theme.spacing.m }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {selectingSide === 'from' ? (t('converter.selectFrom')||'From') : (t('converter.selectTo')||'To')}
                            </Text>
                            <View style={{ width: 60 }} />
                        </View>
                        
                        <View style={styles.searchContainer}>
                             <Text style={styles.searchIcon}>🔍</Text>
                             <TextInput 
                                style={styles.searchInput}
                                placeholder="Search currency..."
                                placeholderTextColor={theme.colors.text.muted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                             />
                        </View>

                        <FlatList
                            data={filteredCurrencies}
                            keyExtractor={item => item.code}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.currencyOption}
                                    onPress={() => handleSelectCurrency(item.code)}
                                >
                                    <View style={styles.currencyInfo}>
                                        <Text style={styles.currencyFlagLarge}>{item.flag}</Text>
                                        <View>
                                            <Text style={styles.currencyCodeLarge}>{item.code}</Text>
                                            <Text style={styles.currencyName}>{item.name}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.currencySymbol}>{item.symbol}</Text>
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
    title: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: theme.spacing.m,
    },
    content: {
        padding: theme.spacing.l,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.l,
    },
    label: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        color: theme.colors.text.primary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    converterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
    },
    currencyButton: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    currencyFlag: {
        fontSize: 20,
    },
    currencyCode: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    carrot: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    swapButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    swapIcon: {
        color: theme.colors.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    resultCard: {
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    resultLabel: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: theme.spacing.s,
    },
    resultValue: {
        color: theme.colors.text.primary,
        fontSize: 40,
        fontWeight: 'bold',
        textShadowColor: theme.colors.primaryGlow,
        textShadowRadius: 10,
    },
    disclaimer: {
        color: theme.colors.text.muted,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalContent: {
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
    modalTitle: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
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
    currencyFlagLarge: {
        fontSize: 24,
    },
    currencyCodeLarge: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    currencyName: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    currencySymbol: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        fontFamily: theme.typography.mono.fontFamily,
    }
});
