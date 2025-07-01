import { api } from './request';

import {ENDPOINT, CreatePlayerData, PaginatedResponse, Player, PlayerQueryParams, UpdatePlayerData} from '@repo/lib';

export const playersApi = {
    getAllPlayers: async (): Promise<PaginatedResponse<Player>> => {
        return api.get<PaginatedResponse<Player>>(ENDPOINT.PLAYERS);
    },

    // Get all players with pagination and search
    getPlayers: async (params: PlayerQueryParams = {}): Promise<PaginatedResponse<Player>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);

        const query = searchParams.toString();
        const endpoint = query ? `${ENDPOINT.PLAYERS}?${query}` : ENDPOINT.PLAYERS;

        return api.get<PaginatedResponse<Player>>(endpoint);
    },

    // Get player by ID
    getPlayer: async (id: string): Promise<Player> => {
        return api.get<Player>(ENDPOINT.PLAYER(id));
    },

    // Create a new player
    createPlayer: async (data: CreatePlayerData): Promise<Player> => {
        return api.post<Player>(ENDPOINT.PLAYERS, data);
    },

    // Update player
    updatePlayer: async (id: string, data: UpdatePlayerData): Promise<Player> => {
        return api.put<Player>(ENDPOINT.PLAYER(id), data);
    },

    // Delete player
    deletePlayer: async (id: string): Promise<void> => {
        return api.delete<void>(ENDPOINT.PLAYER(id));
    },
};