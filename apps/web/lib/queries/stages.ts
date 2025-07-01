
import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import { stagesApi } from '../api';
import {
    Stage,
    PaginatedResponse,
    StageQueryParams
} from '../types/global';

// Query keys
export const stageKeys = {
    all: ['stages'] as const,
    lists: () => [...stageKeys.all, 'list'] as const,
    list: (params: StageQueryParams) => [...stageKeys.lists(), params] as const,
    details: () => [...stageKeys.all, 'detail'] as const,
    detail: (id: string) => [...stageKeys.details(), id] as const,
    byTournament: (tournamentId: string) => [...stageKeys.all, 'tournament', tournamentId] as const,
};

// Get stages with filtering
export const useGetStages = (
    params: StageQueryParams = {},
    options?: UseQueryOptions<PaginatedResponse<Stage>>
) => {
    return useQuery({
        queryKey: stageKeys.list(params),
        queryFn: () => stagesApi.getStages(params),
        ...options,
    });
};

// Get single stage
export const useGetStage = (
    id: string,
    options?: UseQueryOptions<Stage>
) => {
    return useQuery({
        queryKey: stageKeys.detail(id),
        queryFn: () => stagesApi.getStage(id),
        enabled: !!id,
        ...options,
    });
};

// Get stages by tournament
export const useGetStagesByTournament = (
    tournamentId: string,
    additionalParams: Omit<StageQueryParams, 'tournamentId'> = {},
    options?: UseQueryOptions<PaginatedResponse<Stage>>
) => {
    const params = { ...additionalParams, tournamentId };

    return useQuery({
        queryKey: stageKeys.byTournament(tournamentId),
        queryFn: () => stagesApi.getStages(params),
        enabled: !!tournamentId,
        ...options,
    });
};

// Create stage mutation
export const useCreateStage = (
    options?: UseMutationOptions<Stage, Error, {
        tournament: string;
        name: string;
        type: Stage['type'];
        order: number;
        startDate?: string;
        endDate?: string;
        players?: string[];
        advancingPlayers?: number;
        rules?: string;
    }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stagesApi.createStage,
        onSuccess: (data, variables) => {
            // Invalidate stage lists
            queryClient.invalidateQueries({ queryKey: stageKeys.lists() });

            // Invalidate tournament-specific stages
            queryClient.invalidateQueries({
                queryKey: stageKeys.byTournament(variables.tournament)
            });
        },
        ...options,
    });
};

// Update stage mutation
export const useUpdateStage = (
    options?: UseMutationOptions<Stage, Error, {
        id: string;
        data: {
            name?: string;
            type?: Stage['type'];
            order?: number;
            startDate?: string;
            endDate?: string;
            players?: string[];
            advancingPlayers?: number;
            rules?: string;
        }
    }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => stagesApi.updateStage(id, data),
        onSuccess: (updatedStage, variables) => {
            // Update the specific stage in cache
            queryClient.setQueryData(stageKeys.detail(variables.id), updatedStage);

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: stageKeys.lists() });

            // Invalidate tournament-specific stages
            if (typeof updatedStage.tournament === 'string') {
                queryClient.invalidateQueries({
                    queryKey: stageKeys.byTournament(updatedStage.tournament)
                });
            }
        },
        ...options,
    });
};

// Delete stage mutation
export const useDeleteStage = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stagesApi.deleteStage,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: stageKeys.detail(deletedId) });

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: stageKeys.lists() });
            queryClient.invalidateQueries({ queryKey: stageKeys.all });

            // Also invalidate matches since they might be affected
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        },
        ...options,
    });
};

// Add player to stage mutation
export const useAddPlayerToStage = (
    options?: UseMutationOptions<Stage, Error, { stageId: string; playerId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stageId, playerId }) => stagesApi.addPlayerToStage(stageId, playerId),
        onSuccess: (updatedStage, variables) => {
            // Update the specific stage in cache
            queryClient.setQueryData(stageKeys.detail(variables.stageId), updatedStage);

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: stageKeys.lists() });

            // Invalidate tournament-specific stages
            if (typeof updatedStage.tournament === 'string') {
                queryClient.invalidateQueries({
                    queryKey: stageKeys.byTournament(updatedStage.tournament)
                });
            }
        },
        ...options,
    });
};

// Generate matches for stage mutation
export const useGenerateMatches = (
    options?: UseMutationOptions<{ matchCount: number }, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stagesApi.generateMatches,
        onSuccess: (_, stageId) => {
            // Invalidate matches since new ones were created
            queryClient.invalidateQueries({ queryKey: ['matches'] });

            // Invalidate the specific stage to refresh player count, etc.
            queryClient.invalidateQueries({ queryKey: stageKeys.detail(stageId) });
        },
        ...options,
    });
};