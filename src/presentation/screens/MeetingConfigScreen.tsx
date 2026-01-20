
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useMeetingStore } from '../state/useMeetingStore';
import { Participant } from '../../domain/entities/Meeting';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { TeamRepositoryImpl } from '../../infrastructure/repositories/TeamRepositoryImpl';
import { useSettingsStore } from '../state/useSettingsStore';

import { CalendarSelectorModal } from '../components/CalendarSelectorModal';
import { CalendarEvent, CalendarService } from '../../application/services/CalendarService';

export const MeetingConfigScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentMeeting, addParticipant, removeParticipant, updateParticipant, startMeeting, setMeetingTitle, setExpectedDuration } = useMeetingStore();
  const { getCurrencySymbol } = useSettingsStore();
  const currencySymbol = getCurrencySymbol();
  const defaultRate = 0;
  
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');

  const isNoLimit = !currentMeeting.expectedDurationMinutes || currentMeeting.expectedDurationMinutes === 0;

  const handleDurationChange = (text: string) => {
      const minutes = parseInt(text.replace(/[^0-9]/g, ''));
      setExpectedDuration(isNaN(minutes) ? 0 : minutes);
  };

  const toggleNoLimit = (value: boolean) => {
      if (value) {
          setExpectedDuration(0);
      } else {
          setExpectedDuration(60); // Default to 1 hour if reenabling
      }
  };
  
  // Save Team Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');

  const handleEditClick = (participant: Participant) => {
      setEditingParticipant(participant);
      setEditName(participant.name);
      setEditRate(participant.hourlyRate.toString());
      setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
      if (editingParticipant && editName.trim()) {
          updateParticipant(editingParticipant.id, {
              name: editName.trim(),
              hourlyRate: parseFloat(editRate) || 0
          });
          setEditModalVisible(false);
          setEditingParticipant(null);
      }
  };

  const handleCalendarSelect = async (baseEvent: CalendarEvent) => {
      // Fetch full details (attendees might be missing in the list view)
      let event = baseEvent;
      const fullEvent = await CalendarService.getEventDetails(baseEvent.id);
      
      if (fullEvent) {
          event = fullEvent;
      } else {
          console.log('Could not fetch full details, using summary.');
      }

      console.log('Final Import Event:', event);

      setMeetingTitle(event.title);
      
      // Import Duration
      if (event.durationMinutes > 0) {
          useMeetingStore.getState().setExpectedDuration(event.durationMinutes);
      }

      // Import Attendees
      if (event.attendees && event.attendees.length > 0) {
          let count = 0;
          event.attendees.forEach(attendee => {
              // Filter out the user themselves if possible? 
              // Some calendars include the owner as an attendee with status 'accepted'
              
              const displayName = attendee.name || attendee.email || 'Participant';
              addParticipant(displayName, 0, attendee.email); 
              count++;
          });
          
          if (count > 0) {
               Alert.alert(t('common.success'), t('calendar.imported', { count }));
          }
      } else {
          console.log('No attendees found in event object.');
      }
      
      setCalendarModalVisible(false);
  };

  const handleAddParams = () => {
    if (!name || !rate) return;
    const hourly = parseFloat(rate);
    if (isNaN(hourly)) return;

    addParticipant(name, hourly);
    setName('');
    setRate('');
  };

  const handleStart = () => {
    startMeeting();
    router.push('/meeting/live');
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
        Alert.alert(t('common.error'), t('home.enterTeamName'));
        return;
    }
    
    try {
        const repo = new TeamRepositoryImpl();
        await repo.save({
            id: Crypto.randomUUID(),
            name: teamName.trim(),
            participants: currentMeeting.participants
        });
        setModalVisible(false);
        setTeamName('');
        Alert.alert(t('common.success'), t('home.teamSaved'));
    } catch (error) {
        Alert.alert(t('common.error'), t('home.saveError'));
        console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, '#1a1a1a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + theme.spacing.l }]}
    >
      <Stack.Screen options={{ title: t('home.title'), headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: '#fff' }} />
      
      <View style={styles.formSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('home.addParticipant')}</Text>
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <TextInput
              style={[styles.input, { width: '100%', marginBottom: 12 }]}
              placeholder={t('home.meetingTitlePlaceholder')}
              placeholderTextColor="#666"
              value={currentMeeting.title}
              onChangeText={setMeetingTitle}
          />
          <TouchableOpacity 
              style={[styles.calendarAction, { width: '100%' }]}
              onPress={() => setCalendarModalVisible(true)}
          >
              <Text style={styles.calendarActionText}>📅 {t('calendar.import')}</Text>
          </TouchableOpacity>

          <View style={styles.durationRow}>
              <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('home.expectedDuration')}</Text>
                  <TextInput
                      style={[styles.input, isNoLimit && styles.disabledInput]}
                      value={isNoLimit ? '' : currentMeeting.expectedDurationMinutes?.toString()}
                      onChangeText={handleDurationChange}
                      keyboardType="numeric"
                      editable={!isNoLimit}
                      placeholder={isNoLimit ? "Unlimited" : "60"}
                      placeholderTextColor="#999"
                  />
              </View>
              <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>{t('home.ignoreDuration')}</Text>
                  <Switch 
                      value={isNoLimit} 
                      onValueChange={toggleNoLimit}
                      trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                      thumbColor={isNoLimit ? '#fff' : '#f4f3f4'}
                  />
              </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder={t('home.namePlaceholder')}
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={t('home.ratePlaceholder')}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddParams}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamActions}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.loadAction]}
                onPress={() => router.push('/meeting/saved-teams')}
            >
                <Text style={styles.actionText}>📂 {t('home.loadTeam')}</Text>
            </TouchableOpacity>
            
             <TouchableOpacity 
                style={[styles.actionButton, styles.saveAction, currentMeeting.participants.length === 0 && { opacity: 0.5 }]}
                onPress={() => {
                    if (currentMeeting.participants.length > 0) setModalVisible(true);
                }}
                disabled={currentMeeting.participants.length === 0}
            >
                <Text style={styles.actionText}>💾 {t('home.saveTeam')}</Text>
            </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.listHeader}>{t('home.participants')} ({currentMeeting.participants.length})</Text>
      
      <FlatList
        data={currentMeeting.participants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Participant }) => (
          <View style={styles.participantRow}>
            <View>
              <Text style={styles.pName}>{item.name}</Text>
              <Text style={styles.pRate}>{currencySymbol}{item.hourlyRate}/hr</Text>
            </View>
            <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => handleEditClick(item)} style={styles.iconButton}>
                    <Text style={{ fontSize: 18 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeParticipant(item.id)} style={styles.iconButton}>
                    <Text style={styles.removeText}>{t('home.remove')}</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{t('home.totalRate')}</Text>
            <Text style={styles.summaryValue}>
                {currencySymbol}{currentMeeting.participants.reduce((sum, p) => sum + p.hourlyRate, 0).toFixed(2)}/hr
            </Text>
        </View>

        <TouchableOpacity 
            style={[styles.startButton, currentMeeting.participants.length === 0 && styles.disabledButton]} 
            onPress={handleStart}
            disabled={currentMeeting.participants.length === 0}
        >
          <Text style={styles.startButtonText}>{t('home.start')}</Text>
        </TouchableOpacity>
      </View>

      {/* Save Team Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('home.saveModalTitle')}</Text>
                <Text style={styles.modalSubtitle}>{t('home.saveModalSubtitle')}</Text>
                
                <TextInput
                    style={styles.modalInput}
                    placeholder={t('home.teamNamePlaceholder')}
                    placeholderTextColor="#666"
                    value={teamName}
                    onChangeText={setTeamName}
                    autoFocus
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]} 
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.saveButton]} 
                        onPress={handleSaveTeam}
                    >
                        <Text style={styles.saveText}>{t('common.ok')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Participant Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('home.edit')}</Text>
                
                <TextInput
                    style={styles.modalInput}
                    placeholder={t('home.namePlaceholder')}
                    placeholderTextColor="#666"
                    value={editName}
                    onChangeText={setEditName}
                />
                 <TextInput
                    style={styles.modalInput}
                    placeholder={t('home.ratePlaceholder')}
                    placeholderTextColor="#666"
                    value={editRate}
                    onChangeText={setEditRate}
                    keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]} 
                        onPress={() => setEditModalVisible(false)}
                    >
                        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.saveButton]} 
                        onPress={handleSaveEdit}
                    >
                        <Text style={styles.saveText}>{t('home.saveChanges')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      <CalendarSelectorModal 
            visible={calendarModalVisible} 
            onClose={() => setCalendarModalVisible(false)}
            onSelect={handleCalendarSelect}
       />

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    gap: theme.spacing.m,
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.subheader.fontSize,
    fontWeight: 'bold',
  },
  backButton: {
    padding: theme.spacing.s,
    // Resetting previous styles
    width: 'auto',
    height: 'auto',
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 0,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    borderRadius: theme.borderRadius.s,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.surfaceHighlight,
    width: 50,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  teamActions: {
      flexDirection: 'row',
      gap: theme.spacing.m,
  },
  actionButton: {
      flex: 1,
      padding: theme.spacing.s,
      borderRadius: theme.borderRadius.s,
      alignItems: 'center',
      borderWidth: 1,
  },
  loadAction: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
  },
  saveAction: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
  },
  actionText: {
      color: theme.colors.text.secondary,
      fontWeight: '600',
      fontSize: 14,
  },
  listHeader: {
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: theme.spacing.s,
    letterSpacing: 1,
  },
  listContent: {
    gap: theme.spacing.s,
  },
  participantRow: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
  },
  iconButton: {
      padding: 4,
  },
  pName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  pRate: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  removeText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: theme.spacing.l,
    gap: theme.spacing.l,
  },
  summaryBox: {
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: theme.colors.primaryGlow,
    textShadowRadius: 10,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
    shadowOpacity: 0,
  },
  startButtonText: {
    color: '#000', // Black text on green button for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      padding: theme.spacing.xl,
  },
  modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.l,
      borderWidth: 1,
      borderColor: theme.colors.border,
  },
  modalTitle: {
      color: theme.colors.text.primary,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
  },
  modalSubtitle: {
      color: theme.colors.text.muted,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: theme.spacing.l,
  },
  modalInput: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
      borderRadius: theme.borderRadius.m,
      padding: theme.spacing.m,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.l,
  },
  modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.m,
  },
  modalButton: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      alignItems: 'center',
      justifyContent: 'center',
  },
  cancelButton: {
      backgroundColor: theme.colors.surfaceHighlight,
  },
  saveButton: {
      backgroundColor: theme.colors.primary,
  },
  cancelText: {
      color: theme.colors.text.secondary,
      fontWeight: '600',
      fontSize: 16,
      textAlign: 'center',
  },
  saveText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
  },
  calendarAction: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: theme.borderRadius.s,
      padding: 12,
      minHeight: 48, // Ensure touchable area and visibility
  },
  calendarActionText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 16,
  },
  durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: theme.spacing.m,
  },
  switchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
  },
  switchLabel: {
      color: theme.colors.text.secondary,
      fontSize: 12,
      marginBottom: 4,
  },
  label: {
      color: theme.colors.text.secondary,
      fontSize: 12,
      marginBottom: 4,
  },
  disabledInput: {
      opacity: 0.5,
      backgroundColor: theme.colors.surfaceHighlight,
  },
});
