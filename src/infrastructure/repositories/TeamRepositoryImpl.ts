import { Team } from "../../domain/entities/Team";
import { TeamRepository } from "../../domain/repositories/TeamRepository";
import { SQLiteDatabase } from "../database/SQLiteDatabase";

export class TeamRepositoryImpl implements TeamRepository {
    async save(team: Team): Promise<void> {
        const db = await SQLiteDatabase.getInstance();
        await db.runAsync(
            'INSERT OR REPLACE INTO teams (id, name, participants) VALUES (?, ?, ?)',
            team.id,
            team.name,
            JSON.stringify(team.participants)
        );
    }

    async getAll(): Promise<Team[]> {
        const db = await SQLiteDatabase.getInstance();
        const results = await db.getAllAsync<{ id: string; name: string; participants: string }>('SELECT * FROM teams');
        return results.map(row => ({
            id: row.id,
            name: row.name,
            participants: JSON.parse(row.participants)
        }));
    }

    async delete(id: string): Promise<void> {
        const db = await SQLiteDatabase.getInstance();
        await db.runAsync('DELETE FROM teams WHERE id = ?', id);
    }
}
