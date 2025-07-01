import { api } from './request';
import {
  Tournament,
  CreateTournamentData,
  UpdateTournamentData,
  PaginatedResponse,
  TournamentQueryParams
} from '../types/global';
import { ENDPOINT } from '@repo/lib';

export const tournamentsApi = {
  // Get all tournaments with pagination and search
  getTournaments: async (params: TournamentQueryParams = {}): Promise<PaginatedResponse<Tournament>> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = query ? `${ENDPOINT.TOURNAMENTS}?${query}` : ENDPOINT.TOURNAMENTS;

    return api.get<PaginatedResponse<Tournament>>(endpoint);
  },

  // Get tournament by ID
  getTournament: async (id: string): Promise<Tournament> => {
    return api.get<Tournament>(ENDPOINT.TOURNAMENT(id));
  },

  // Create new tournament
  createTournament: async (data: CreateTournamentData): Promise<Tournament> => {
    return api.post<Tournament>(ENDPOINT.TOURNAMENTS, data);
  },

  // Update tournament
  updateTournament: async (id: string, data: UpdateTournamentData): Promise<Tournament> => {
    return api.put<Tournament>(ENDPOINT.TOURNAMENT(id), data);
  },

  // Delete tournament
  deleteTournament: async (id: string): Promise<void> => {
    return api.delete<void>(ENDPOINT.TOURNAMENT(id));
  },

  // Add player to tournament
  addPlayerToTournament: async (tournamentId: string, playerId: string): Promise<Tournament> => {
    return api.put<Tournament>(`${ENDPOINT.TOURNAMENT(tournamentId)}/players`, { playerId });
  },

  // Remove player from tournament
  removePlayerFromTournament: async (tournamentId: string, playerId: string): Promise<Tournament> => {
    return api.delete<Tournament>(`${ENDPOINT.TOURNAMENT(tournamentId)}/players`, {
      body: JSON.stringify({ playerId }),
      headers: { 'Content-Type': 'application/json' }
    });
  },
};