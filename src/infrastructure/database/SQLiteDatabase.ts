import * as SQLite from 'expo-sqlite';

export class SQLiteDatabase {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static dbName = 'meeting_cost_pro.db';

  public static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!this.instance) {
      this.instance = await SQLite.openDatabaseAsync(this.dbName);
      await this.initDatabase(this.instance);
    }
    return this.instance;
  }

  private static async initDatabase(db: SQLite.SQLiteDatabase) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        start_time INTEGER,
        end_time INTEGER,
        accumulated_cost REAL NOT NULL,
        elapsed_seconds REAL NOT NULL,
        participants_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        participants TEXT NOT NULL
      );
    `);
  }
}
