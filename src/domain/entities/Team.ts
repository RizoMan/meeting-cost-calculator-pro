import { Participant } from "./Meeting";

export interface Team {
    id: string;
    name: string;
    participants: Participant[];
}
