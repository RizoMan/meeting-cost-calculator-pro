import { MeetingRepository } from '../../domain/repositories/MeetingRepository';
import { Meeting, Participant } from '../../domain/entities/Meeting';
import { SQLiteDatabase } from '../database/SQLiteDatabase';

export class MeetingRepositoryImpl implements MeetingRepository {
  async save(meeting: Meeting): Promise<void> {
    const db = await SQLiteDatabase.getInstance();
    await db.runAsync(
      `INSERT OR REPLACE INTO meetings (id, title, status, start_time, end_time, accumulated_cost, elapsed_seconds, participants_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        meeting.id,
        meeting.title,
        meeting.status,
        meeting.startTime ? meeting.startTime.getTime() : null,
        meeting.endTime ? meeting.endTime.getTime() : null,
        meeting.accumulatedCost,
        meeting.elapsedSeconds,
        JSON.stringify(meeting.participants),
      ]
    );
  }

  async findById(id: string): Promise<Meeting | null> {
    const db = await SQLiteDatabase.getInstance();
    const result = await db.getFirstAsync<any>('SELECT * FROM meetings WHERE id = ?;', [id]);

    if (!result) return null;

    return this.mapRowToMeeting(result);
  }

  async getAll(): Promise<Meeting[]> {
    const db = await SQLiteDatabase.getInstance();
    const results = await db.getAllAsync<any>('SELECT * FROM meetings ORDER BY start_time DESC;');
    return results.map(this.mapRowToMeeting);
  }

  async delete(id: string): Promise<void> {
    const db = await SQLiteDatabase.getInstance();
    await db.runAsync('DELETE FROM meetings WHERE id = ?;', [id]);
  }

  private mapRowToMeeting(row: any): Meeting {
    return {
      id: row.id,
      title: row.title,
      status: row.status as any,
      startTime: row.start_time ? new Date(row.start_time) : null,
      endTime: row.end_time ? new Date(row.end_time) : null,
      accumulatedCost: row.accumulated_cost,
      elapsedSeconds: row.elapsed_seconds,
      participants: JSON.parse(row.participants_json) as Participant[],
    };
  }
}
