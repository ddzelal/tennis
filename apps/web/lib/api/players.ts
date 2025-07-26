import { api } from './request';

import {
    ENDPOINT,
    CreatePlayerData,
    UpdatePlayerData,
    PlayerQueryParams,
    // Import response types
    GetAllPlayersResponse,
    GetPlayerByIdResponse,
    CreatePlayerResponse,
    UpdatePlayerResponse,
    DeletePlayerResponse
} from '@repo/lib';

export const playersApi = {
    // Get all players (deprecated - use getPlayers instead)
    getAllPlayers: async (): Promise<GetAllPlayersResponse> => {
        return api.get<GetAllPlayersResponse>(ENDPOINT.PLAYERS);
    },

    // Get all players with pagination and search
    getPlayers: async (params: PlayerQueryParams = {}): Promise<GetAllPlayersResponse> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);

        const query = searchParams.toString();
        const endpoint = query ? `${ENDPOINT.PLAYERS}?${query}` : ENDPOINT.PLAYERS;

        return api.get<GetAllPlayersResponse>(endpoint);
    },

    // Get player by ID
    getPlayer: async (id: string): Promise<GetPlayerByIdResponse> => {
        return api.get<GetPlayerByIdResponse>(ENDPOINT.PLAYER(id));
    },

    // Create a new player
    createPlayer: async (data: CreatePlayerData): Promise<CreatePlayerResponse> => {
        return api.post<CreatePlayerResponse>(ENDPOINT.PLAYERS, data);
    },

    // Update player
    updatePlayer: async (id: string, data: UpdatePlayerData): Promise<UpdatePlayerResponse> => {
        return api.put<UpdatePlayerResponse>(ENDPOINT.PLAYER(id), data);
    },

    // Delete player
    deletePlayer: async (id: string): Promise<DeletePlayerResponse> => {
        return api.delete<DeletePlayerResponse>(ENDPOINT.PLAYER(id));
    },
};