export interface Participant {
  id: string;
  name: string;
  hourlyRate: number;
}

export type MeetingStatus = 'idle' | 'active' | 'paused' | 'completed';

export interface Meeting {
  id: string;
  title: string;
  participants: Participant[];
  status: MeetingStatus;
  startTime: Date | null;
  endTime: Date | null;
  accumulatedCost: number; // Snapshot of cost when paused/stopped
  elapsedSeconds: number; // Tracked duration
}

export const createMeeting = (id: string, title?: string): Meeting => ({
  id,
  title: title || 'Deep Work Session',
  participants: [],
  status: 'idle',
  startTime: null,
  endTime: null,
  accumulatedCost: 0,
  elapsedSeconds: 0,
});
