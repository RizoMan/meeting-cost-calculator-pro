import { Meeting } from '../entities/Meeting';

export interface MeetingRepository {
  save(meeting: Meeting): Promise<void>;
  findById(id: string): Promise<Meeting | null>;
  getAll(): Promise<Meeting[]>;
  delete(id: string): Promise<void>;
}
