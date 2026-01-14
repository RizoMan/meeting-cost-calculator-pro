import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useMeetingStore } from '../state/useMeetingStore';
import { Participant } from '../../domain/entities/Meeting';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { TeamRepositoryImpl } from '../../infrastructure/repositories/TeamRepositoryImpl';

export const MeetingConfigScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentMeeting, addParticipant, removeParticipant, startMeeting } = useMeetingStore();
  
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  
  // Save Team Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');

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
        Alert.alert("Error", "Please enter a team name.");
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
        Alert.alert("Success", "Team saved successfully!");
    } catch (error) {
        Alert.alert("Error", "Failed to save team.");
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
      <Stack.Screen options={{ title: 'Setup Meeting', headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: '#fff' }} />
      
      <View style={styles.formSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Participants</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Name (e.g. Dev Team)"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="$/hr"
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
                <Text style={styles.actionText}>📂 Load Team</Text>
            </TouchableOpacity>
            
             <TouchableOpacity 
                style={[styles.actionButton, styles.saveAction, currentMeeting.participants.length === 0 && { opacity: 0.5 }]}
                onPress={() => {
                    if (currentMeeting.participants.length > 0) setModalVisible(true);
                }}
                disabled={currentMeeting.participants.length === 0}
            >
                <Text style={styles.actionText}>💾 Save Team</Text>
            </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.listHeader}>Team Members ({currentMeeting.participants.length})</Text>
      
      <FlatList
        data={currentMeeting.participants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Participant }) => (
          <View style={styles.participantRow}>
            <View>
              <Text style={styles.pName}>{item.name}</Text>
              <Text style={styles.pRate}>${item.hourlyRate}/hr</Text>
            </View>
            <TouchableOpacity onPress={() => removeParticipant(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Hourly Rate</Text>
            <Text style={styles.summaryValue}>
                ${currentMeeting.participants.reduce((sum, p) => sum + p.hourlyRate, 0).toFixed(2)}/hr
            </Text>
        </View>

        <TouchableOpacity 
            style={[styles.startButton, currentMeeting.participants.length === 0 && styles.disabledButton]} 
            onPress={handleStart}
            disabled={currentMeeting.participants.length === 0}
        >
          <Text style={styles.startButtonText}>Start Meeting</Text>
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
                <Text style={styles.modalTitle}>Save Team</Text>
                <Text style={styles.modalSubtitle}>Give this group a name to load it later.</Text>
                
                <TextInput
                    style={styles.modalInput}
                    placeholder="Team Name (e.g. Marketing Dept)"
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
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.saveButton]} 
                        onPress={handleSaveTeam}
                    >
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

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
  },
  saveText: {
      color: '#000',
      fontWeight: 'bold',
  },
});
