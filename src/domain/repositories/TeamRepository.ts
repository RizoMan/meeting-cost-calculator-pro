import { Team } from "../entities/Team";

export interface TeamRepository {
    save(team: Team): Promise<void>;
    getAll(): Promise<Team[]>;
    delete(id: string): Promise<void>;
}
