import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Team } from '../../domain/entities/Team';
import { TeamRepositoryImpl } from '../../infrastructure/repositories/TeamRepositoryImpl';
import { useMeetingStore } from '../state/useMeetingStore';

export const SavedTeamsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setParticipants } = useMeetingStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const repo = new TeamRepositoryImpl();
      const data = await repo.getAll();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTeam = (team: Team) => {
    // Overwrite current participants
    setParticipants(team.participants);
    router.back();
  };

  const handleDeleteTeam = async (id: string) => {
    Alert.alert(
        "Delete Team",
        "Are you sure?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    const repo = new TeamRepositoryImpl();
                    await repo.delete(id);
                    loadTeams();
                }
            }
        ]
    );
  };

  const renderItem = ({ item }: { item: Team }) => (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.memberCount}>{item.participants.length} Members</Text>
      </View>
      
      <View style={styles.participantsPreview}>
        <Text style={styles.previewText} numberOfLines={1}>
            {item.participants.map(p => p.name).join(', ')}
        </Text>
      </View>
      
      <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleDeleteTeam(item.id)}
          >
              <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.loadButton]}
            onPress={() => handleLoadTeam(item)}
          >
              <Text style={styles.loadText}>Load Team</Text>
          </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.m }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Teams</Text>
      </View>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadTeams}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved teams found.</Text>
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
    paddingHorizontal: theme.spacing.m,
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
  listContent: {
    gap: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  teamName: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  memberCount: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  participantsPreview: {
    marginBottom: theme.spacing.m,
  },
  previewText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.m,
  },
  button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.s,
      borderWidth: 1,
  },
  deleteButton: {
      borderColor: theme.colors.danger,
  },
  loadButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
  },
  deleteText: {
      color: theme.colors.danger,
      fontWeight: '600',
      fontSize: 12,
  },
  loadText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  emptyText: {
    color: theme.colors.text.muted,
    fontSize: 16,
  }
});
