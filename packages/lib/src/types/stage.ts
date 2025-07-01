import { Tournament } from "./tournament";
import { Player } from "./player";

export enum StageType {
    GROUP = 'GROUP',
    ROUND_ROBIN = 'ROUND_ROBIN',
    KNOCKOUT = 'KNOCKOUT',
    SEMIFINALS = 'SEMIFINALS',
    FINALS = 'FINALS',
    CUSTOM = 'CUSTOM',
}

export enum StageStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface StageRules {
    setsToWin?: number;
    tieBreak?: boolean;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
}

export interface Stage {
    _id: string;
    tournament: string | Tournament;
    name: string;
    type: StageType;
    status: StageStatus;
    order: number;
    startDate?: string;
    endDate?: string;
    players: string[] | Player[];
    advancingPlayers?: number;
    rules?: StageRules;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStageData {
    tournament: string;
    name: string;
    type: StageType;
    order: number;
    startDate?: string;
    endDate?: string;
    players?: string[];
    advancingPlayers?: number;
    rules?: StageRules;
}

export interface UpdateStageData {
    name?: string;
    type?: StageType;
    status?: StageStatus;
    order?: number;
    startDate?: string;
    endDate?: string;
    players?: string[];
    advancingPlayers?: number;
    rules?: StageRules;
}

export interface StageQueryParams {
    page?: number;
    limit?: number;
    tournamentId?: string;
    type?: StageType;
    status?: StageStatus;
}

// Backend interface (extends Document)
export interface IStageDocument {
    tournament: any; // mongoose.Types.ObjectId
    name: string;
    type: StageType;
    status: StageStatus;
    order: number;
    startDate?: Date;
    endDate?: Date;
    players: any[]; // mongoose.Types.ObjectId[]
    advancingPlayers?: number;
    rules?: StageRules;
    createdAt: Date;
    updatedAt: Date;
}