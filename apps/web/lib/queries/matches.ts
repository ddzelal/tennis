import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import { matchesApi } from '../api';
import {
    Match,
    MatchSet,
    PaginatedResponse,
    MatchQueryParams
} from '../types/global';

// Query keys
export const matchKeys = {
    all: ['matches'] as const,
    lists: () => [...matchKeys.all, 'list'] as const,
    list: (params: MatchQueryParams) => [...matchKeys.lists(), params] as const,
    details: () => [...matchKeys.all, 'detail'] as const,
    detail: (id: string) => [...matchKeys.details(), id] as const,
    byTournament: (tournamentId: string) => [...matchKeys.all, 'tournament', tournamentId] as const,
    byStage: (stageId: string) => [...matchKeys.all, 'stage', stageId] as const,
    byPlayer: (playerId: string) => [...matchKeys.all, 'player', playerId] as const,
};

// Get matches with filtering
export const useGetMatches = (
    params: MatchQueryParams = {},
    options?: UseQueryOptions<PaginatedResponse<Match>>
) => {
    return useQuery({
        queryKey: matchKeys.list(params),
        queryFn: () => matchesApi.getMatches(params),
        ...options,
    });
};

// Get single match
export const useGetMatch = (
    id: string,
    options?: UseQueryOptions<Match>
) => {
    return useQuery({
        queryKey: matchKeys.detail(id),
        queryFn: () => matchesApi.getMatch(id),
        enabled: !!id,
        ...options,
    });
};

// Get matches by tournament
export const useGetMatchesByTournament = (
    tournamentId: string,
    additionalParams: Omit<MatchQueryParams, 'tournamentId'> = {},
    options?: UseQueryOptions<PaginatedResponse<Match>>
) => {
    const params = { ...additionalParams, tournamentId };

    return useQuery({
        queryKey: matchKeys.byTournament(tournamentId),
        queryFn: () => matchesApi.getMatches(params),
        enabled: !!tournamentId,
        ...options,
    });
};

// Get matches by stage
export const useGetMatchesByStage = (
    stageId: string,
    additionalParams: Omit<MatchQueryParams, 'stageId'> = {},
    options?: UseQueryOptions<PaginatedResponse<Match>>
) => {
    const params = { ...additionalParams, stageId };

    return useQuery({
        queryKey: matchKeys.byStage(stageId),
        queryFn: () => matchesApi.getMatches(params),
        enabled: !!stageId,
        ...options,
    });
};

// Get matches by player
export const useGetMatchesByPlayer = (
    playerId: string,
    additionalParams: Omit<MatchQueryParams, 'playerId'> = {},
    options?: UseQueryOptions<PaginatedResponse<Match>>
) => {
    const params = { ...additionalParams, playerId };

    return useQuery({
        queryKey: matchKeys.byPlayer(playerId),
        queryFn: () => matchesApi.getMatches(params),
        enabled: !!playerId,
        ...options,
    });
};

// Create match mutation
export const useCreateMatch = (
    options?: UseMutationOptions<Match, Error, {
        tournament: string;
        stage?: string;
        player1: string;
        player2: string;
        scheduledDate?: string;
        status?: Match['status'];
    }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: matchesApi.createMatch,
        onSuccess: (data, variables) => {
            // Invalidate relevant match lists
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

            // Invalidate tournament-specific matches
            if (variables.tournament) {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byTournament(variables.tournament)
                });
            }

            // Invalidate stage-specific matches
            if (variables.stage) {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byStage(variables.stage)
                });
            }

            // Invalidate player-specific matches
            queryClient.invalidateQueries({
                queryKey: matchKeys.byPlayer(variables.player1)
            });
            queryClient.invalidateQueries({
                queryKey: matchKeys.byPlayer(variables.player2)
            });
        },
        ...options,
    });
};

// Update match mutation
export const useUpdateMatch = (
    options?: UseMutationOptions<Match, Error, {
        id: string;
        data: {
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
        }
    }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => matchesApi.updateMatch(id, data),
        onSuccess: (updatedMatch, variables) => {
            // Update the specific match in cache
            queryClient.setQueryData(matchKeys.detail(variables.id), updatedMatch);

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

            // Invalidate related queries
            if (typeof updatedMatch.tournament === 'string') {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byTournament(updatedMatch.tournament)
                });
            }

            if (updatedMatch.stage && typeof updatedMatch.stage === 'string') {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byStage(updatedMatch.stage)
                });
            }
        },
        ...options,
    });
};

// Delete match mutation
export const useDeleteMatch = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: matchesApi.deleteMatch,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: matchKeys.detail(deletedId) });

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            queryClient.invalidateQueries({ queryKey: matchKeys.all });
        },
        ...options,
    });
};

// Record match result mutation
export const useRecordMatchResult = (
    options?: UseMutationOptions<Match, Error, {
        id: string;
        data: {
            sets: MatchSet[];
            winner: string;
        }
    }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => matchesApi.recordMatchResult(id, data),
        onSuccess: (updatedMatch, variables) => {
            // Update the specific match in cache
            queryClient.setQueryData(matchKeys.detail(variables.id), updatedMatch);

            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

            // Invalidate player-specific matches (for stats update)
            if (typeof updatedMatch.player1 === 'string') {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byPlayer(updatedMatch.player1)
                });
            }
            if (typeof updatedMatch.player2 === 'string') {
                queryClient.invalidateQueries({
                    queryKey: matchKeys.byPlayer(updatedMatch.player2)
                });
            }
        },
        ...options,
    });
};