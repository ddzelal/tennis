import { api } from "./request";
import {
  ENDPOINT,
  PaginatedResponse,
  Stage,
  StageDetails,
  StageQueryParams,
} from "@repo/lib";

export const stagesApi = {
  // Get all stages with filtering
  getStages: async (
    params: StageQueryParams = {},
  ): Promise<PaginatedResponse<StageDetails>> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.tournamentId)
      searchParams.append("tournamentId", params.tournamentId);

    const query = searchParams.toString();
    const endpoint = query ? `${ENDPOINT.STAGES}?${query}` : ENDPOINT.STAGES;

    return api.get<PaginatedResponse<StageDetails>>(endpoint);
  },

  // Get stage by ID
  getStage: async (id: string): Promise<StageDetails> => {
    return await api.getSingle<StageDetails>(ENDPOINT.STAGE(id));
  },

  // Create a new stage
  createStage: async (data: {
    tournament: string;
    name: string;
    type: Stage["type"];
    order: number;
    startDate?: string;
    endDate?: string;
    players?: string[];
    advancingPlayers?: number;
    rules?: string;
  }): Promise<Stage> => {
    return api.post<Stage>(ENDPOINT.STAGES, data);
  },

  // Update stage
  updateStage: async (
    id: string,
    data: {
      name?: string;
      type?: Stage["type"];
      order?: number;
      startDate?: string;
      endDate?: string;
      players?: string[];
      advancingPlayers?: number;
      rules?: string;
    },
  ): Promise<Stage> => {
    return api.put<Stage>(ENDPOINT.STAGE(id), data);
  },

  // Delete stage
  deleteStage: async (id: string): Promise<void> => {
    return api.delete<void>(ENDPOINT.STAGE(id));
  },

  // Add player to stage
  addPlayerToStage: async (
    stageId: string,
    playerId: string,
  ): Promise<Stage> => {
    return api.post<Stage>(`${ENDPOINT.STAGE(stageId)}/players`, { playerId });
  },

  // Remove player from the stage
  removePlayerFromStage: async (
    stageId: string,
    playerId: string,
  ): Promise<Stage> => {
    return api.delete<Stage>(`${ENDPOINT.STAGE(stageId)}/players/${playerId}`);
  },

  // Generate matches for stage
  generateMatches: async (stageId: string): Promise<{ matchCount: number }> => {
    return api.post<{ matchCount: number }>(
      `${ENDPOINT.STAGE(stageId)}/generate-matches`,
    );
  },
};
