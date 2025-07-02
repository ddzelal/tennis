import { api } from './request';
import {ENDPOINT, Match, MatchQueryParams, MatchSet, PaginatedResponse} from '@repo/lib';

export const matchesApi = {
    // Get all matches with filtering
    getMatches: async (params: MatchQueryParams = {}): Promise<PaginatedResponse<Match>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.tournamentId) searchParams.append('tournamentId', params.tournamentId);
        if (params.stageId) searchParams.append('stageId', params.stageId);
        if (params.playerId) searchParams.append('playerId', params.playerId);
        if (params.status) searchParams.append('status', params.status);

        const query = searchParams.toString();
        const endpoint = query ? `${ENDPOINT.MATCHES}?${query}` : ENDPOINT.MATCHES;

        return api.get<PaginatedResponse<Match>>(endpoint);
    },

    // Get match by ID
    getMatch: async (id: string): Promise<Match> => {
        return api.getSingle<Match>(ENDPOINT.MATCH(id));
    },

    // Create new match
    createMatch: async (data: {
        tournament: string;
        stage?: string;
        player1: string;
        player2: string;
        scheduledDate?: string;
        status?: Match['status'];
    }): Promise<Match> => {
        return api.post<Match>(ENDPOINT.MATCHES, data);
    },

    // Update match
    updateMatch: async (id: string, data: {
        tournament?: string;
        stage?: string;
        player1?: string;
        player2?: string;
        scheduledDate?: string;
        completedDate?: string;
        status?: Match['status'];
        sets?: MatchSet[];
        winner?: string;
        notes?: string;
    }): Promise<Match> => {
        return api.put<Match>(ENDPOINT.MATCH(id), data);
    },

    // Delete match
    deleteMatch: async (id: string): Promise<void> => {
        return api.delete<void>(ENDPOINT.MATCH(id));
    },

    // Record match result - FIXED: Changed PUT to POST
    recordMatchResult: async (id: string, data: {
        sets: MatchSet[];
        winner: string;
    }): Promise<Match> => {
        return api.post<Match>(`${ENDPOINT.MATCH(id)}/result`, data);
    },
};