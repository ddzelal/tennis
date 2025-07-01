// Tournament types from backend
import {Player} from "./player";
import {Stage} from "./stage";

export enum TournamentType {
    LEAGUE = 'LEAGUE',
    KNOCKOUT = 'KNOCKOUT',
    GROUP_KNOCKOUT = 'GROUP_KNOCKOUT',
    ROUND_ROBIN = 'ROUND_ROBIN',
    CUSTOM = 'CUSTOM',
}

export enum TournamentStatus {
    DRAFT = 'DRAFT',
    REGISTRATION = 'REGISTRATION',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface TournamentSettings {
    setsToWin?: number;
    gamesPerSet?: number;
    tieBreak?: boolean;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
    tiebreakers?: string[];
}

export interface Tournament {
    _id: string;
    name: string;
    description?: string;
    type: TournamentType;
    status: TournamentStatus;
    startDate?: string;
    endDate?: string;
    players: string[] | Player[];
    stages?: string[] | Stage[];
    maxPlayers?: number;
    currentStage?: number;
    settings?: TournamentSettings;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTournamentData {
    name: string;
    description?: string;
    type: TournamentType;
    startDate?: string;
    endDate?: string;
    maxPlayers?: number;
    settings?: TournamentSettings;
}

export interface UpdateTournamentData {
    name?: string;
    description?: string;
    type?: TournamentType;
    status?: TournamentStatus;
    startDate?: string;
    endDate?: string;
    maxPlayers?: number;
    settings?: TournamentSettings;
}

export interface TournamentQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: TournamentType;
    status?: TournamentStatus;
}

// Backend interface (extends Document) - isto kao IPlayerDocument
export interface ITournamentDocument {
    name: string;
    description?: string;
    type: TournamentType;
    status: TournamentStatus;
    startDate?: Date;
    endDate?: Date;
    players: any[]; // mongoose.Types.ObjectId[] ili IPlayer[]
    stages?: any[]; // mongoose.Types.ObjectId[] ili IStage[]
    maxPlayers?: number;
    currentStage?: number;
    settings?: TournamentSettings;
    createdBy: any; // mongoose.Types.ObjectId
    createdAt: Date;
    updatedAt: Date;
}