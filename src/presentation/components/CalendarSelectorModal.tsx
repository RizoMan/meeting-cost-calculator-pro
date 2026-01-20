
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme/theme';
import { CalendarService, CalendarEvent } from '../../application/services/CalendarService';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (event: CalendarEvent) => void;
}

export const CalendarSelectorModal = ({ visible, onClose, onSelect }: Props) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (visible) {
            loadEvents();
        }
    }, [visible, currentDate]);

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CalendarService.getEventsForDate(currentDate);
            if (data.length === 0) {
                setError(t('calendar.noEvents') || 'No events found for this day.');
            }
            setEvents(data);
        } catch (err: any) {
            if (err.message === 'MISSING_PERMISSION') {
                setError(t('calendar.permissionError') || 'Calendar permission denied.');
            } else {
                setError(t('common.error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: CalendarEvent }) => {
        const startDate = new Date(item.startDate);
        const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
            <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{startTime}</Text>
                    <Text style={styles.durationText}>{item.durationMinutes}m</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.description ? <Text numberOfLines={1} style={styles.itemDesc}>{item.description}</Text> : null}
                </View>
                <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
        );
    };

    const formattedDate = currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + theme.spacing.m, paddingBottom: insets.bottom + theme.spacing.m }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{t('calendar.import')}</Text>
                        <View style={{ width: 60 }} /> 
                    </View>

                    {/* Date Navigator */}
                    <View style={styles.dateNav}>
                        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn}>
                            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn}>
                            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />}
                    
                    {!loading && error && (
                        <View style={styles.center}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={loadEvents} style={styles.retryBtn}>
                                <Ionicons name="refresh" size={20} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
                                <Text style={styles.retryText}>{t('common.retry') || 'Retry'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!loading && !error && (
                        <FlatList
                            data={events}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        color: theme.colors.primary,
        fontSize: 16,
    },
    dateNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: theme.spacing.s,
    },
    navBtn: {
        padding: 10,
    },
    dateText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 120,
        textAlign: 'center',
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        padding: theme.spacing.m,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    timeBox: {
        alignItems: 'center',
        marginRight: theme.spacing.m,
        width: 50,
    },
    timeText: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    durationText: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    infoBox: {
        flex: 1,
    },
    itemTitle: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    itemDesc: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginTop: 2,
    },
    arrow: {
        color: theme.colors.text.muted,
        fontSize: 20,
        marginLeft: theme.spacing.s,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        color: theme.colors.text.muted,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceHighlight,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    retryText: {
        color: theme.colors.text.primary,
        fontWeight: '600',
        fontSize: 16,
    }
});
