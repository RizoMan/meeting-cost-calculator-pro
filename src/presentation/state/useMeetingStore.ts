import { create } from 'zustand';
import { Meeting, Participant, createMeeting } from '../../domain/entities/Meeting';
import { CostCalculator } from '../../domain/services/CostCalculator';
import * as Crypto from 'expo-crypto';
import { MeetingRepositoryImpl } from '../../infrastructure/repositories/MeetingRepositoryImpl';

interface MeetingState {
  currentMeeting: Meeting;
  
  // Actions
  startMeeting: () => void;
  pauseMeeting: () => void;
  stopMeeting: () => void;
  resetMeeting: () => void;
  tick: () => void; // Called every second
  
  addParticipant: (name: string, hourlyRate: number) => void;
  removeParticipant: (id: string) => void;
  setParticipants: (participants: Participant[]) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  currentMeeting: createMeeting('temp-id'),

  startMeeting: () => set((state) => {
    if (state.currentMeeting.status === 'active') return state;
    return {
      currentMeeting: {
        ...state.currentMeeting,
        status: 'active',
        startTime: state.currentMeeting.startTime || new Date(),
      }
    };
  }),

  pauseMeeting: () => set((state) => ({
    currentMeeting: {
      ...state.currentMeeting,
      status: 'paused',
    }
  })),

  stopMeeting: async () => {
    const { currentMeeting } = get();
    const endTime = new Date();
    const finalMeeting = {
      ...currentMeeting,
      status: 'completed' as const,
      endTime,
    };

    set({ currentMeeting: finalMeeting });

    try {
      const repo = new MeetingRepositoryImpl();
      await repo.save(finalMeeting);
      console.log('Meeting saved:', finalMeeting.id);
    } catch (error) {
      console.error('Failed to save meeting:', error);
    }
  },

  resetMeeting: () => set({
    currentMeeting: createMeeting(Crypto.randomUUID())
  }),

  tick: () => set((state) => {
    if (state.currentMeeting.status !== 'active') return state;

    const nextElapsed = state.currentMeeting.elapsedSeconds + 1;
    // Recalculate cost
    const nextMeeting = {
      ...state.currentMeeting,
      elapsedSeconds: nextElapsed,
    };
    
    // Calculate new total cost
    const newCost = CostCalculator.calculateTotalCost(nextMeeting);
    nextMeeting.accumulatedCost = newCost;

    return { currentMeeting: nextMeeting };
  }),

  addParticipant: (name, hourlyRate) => set((state) => {
    const newParticipant: Participant = {
      id: Crypto.randomUUID(),
      name,
      hourlyRate
    };
    return {
      currentMeeting: {
        ...state.currentMeeting,
        participants: [...state.currentMeeting.participants, newParticipant]
      }
    };
  }),

  removeParticipant: (id) => set((state) => ({
    currentMeeting: {
      ...state.currentMeeting,
      participants: state.currentMeeting.participants.filter(p => p.id !== id)
    }
  })),
  
  setParticipants: (participants) => set((state) => ({
    currentMeeting: {
      ...state.currentMeeting,
      participants
    }
  })),
}));
