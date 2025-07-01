import {Player} from "@repo/lib";



// Tournament types
export interface Tournament {
    _id: string;
    name: string;
    description?: string;
    type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate?: string;
    endDate?: string;
    players: string[] | Player[];
    maxPlayers?: number;
    rules?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTournamentData {
    name: string;
    description?: string;
    type: Tournament['type'];
    startDate?: string;
    endDate?: string;
    players?: string[];
    maxPlayers?: number;
    rules?: string;
    createdBy?: string;
}

export interface UpdateTournamentData {
    name?: string;
    description?: string;
    type?: Tournament['type'];
    status?: Tournament['status'];
    startDate?: string;
    endDate?: string;
    players?: string[];
    maxPlayers?: number;
    rules?: string;
}

// Match types
export interface Match {
    _id: string;
    tournament: string | Tournament;
    stage?: string;
    player1: string | Player;
    player2: string | Player;
    winner?: string | Player;
    scheduledDate?: string;
    completedDate?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    sets: MatchSet[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MatchSet {
    player1Score: number;
    player2Score: number;
    tiebreak?: {
        player1Score: number;
        player2Score: number;
    };
}

// Stage types
export interface Stage {
    _id: string;
    tournament: string | Tournament;
    name: string;
    type: 'GROUP' | 'KNOCKOUT' | 'SEMIFINALS' | 'FINALS' | 'ROUND_ROBIN';
    order: number;
    startDate?: string;
    endDate?: string;
    players: string[] | Player[];
    advancingPlayers?: number;
    rules?: string;
    createdAt: string;
    updatedAt: string;
}

// Query parameters types
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SearchParams {
    search?: string;
}

export interface PlayerQueryParams extends PaginationParams, SearchParams {}

export interface TournamentQueryParams extends PaginationParams, SearchParams {}

export interface MatchQueryParams extends PaginationParams {
    tournamentId?: string;
    stageId?: string;
    playerId?: string;
    status?: Match['status'];
}

export interface StageQueryParams extends PaginationParams {
    tournamentId?: string;
}