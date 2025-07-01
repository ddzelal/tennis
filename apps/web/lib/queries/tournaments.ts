import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import { tournamentsApi } from '../api';
import {
    Tournament,
    CreateTournamentData,
    UpdateTournamentData,
    PaginatedResponse,
    TournamentQueryParams
} from '../types/global';

// Query keys
export const tournamentKeys = {
    all: ['tournaments'] as const,
    lists: () => [...tournamentKeys.all, 'list'] as const,
    list: (params: TournamentQueryParams) => [...tournamentKeys.lists(), params] as const,
    details: () => [...tournamentKeys.all, 'detail'] as const,
    detail: (id: string) => [...tournamentKeys.details(), id] as const,
};

// Get tournaments with pagination and search
export const useGetTournaments = (
    params: TournamentQueryParams = {},
    options?: UseQueryOptions<PaginatedResponse<Tournament>>
) => {
    return useQuery({
        queryKey: tournamentKeys.list(params),
        queryFn: () => tournamentsApi.getTournaments(params),
        ...options,
    });
};

// Get single tournament
export const useGetTournament = (
    id: string,
    options?: UseQueryOptions<Tournament>
) => {
    return useQuery({
        queryKey: tournamentKeys.detail(id),
        queryFn: () => tournamentsApi.getTournament(id),
        enabled: !!id,
        ...options,
    });
};

// Create tournament mutation
export const useCreateTournament = (
    options?: UseMutationOptions<Tournament, Error, CreateTournamentData>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tournamentsApi.createTournament,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
        ...options,
    });
};

// Update tournament mutation
export const useUpdateTournament = (
    options?: UseMutationOptions<Tournament, Error, { id: string; data: UpdateTournamentData }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => tournamentsApi.updateTournament(id, data),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(tournamentKeys.detail(variables.id), data);
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
        ...options,
    });
};

// Delete tournament mutation
export const useDeleteTournament = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tournamentsApi.deleteTournament,
        onSuccess: (_, deletedId) => {
            queryClient.removeQueries({ queryKey: tournamentKeys.detail(deletedId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
        ...options,
    });
};

// Add player to tournament mutation
export const useAddPlayerToTournament = (
    options?: UseMutationOptions<Tournament, Error, { tournamentId: string; playerId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tournamentId, playerId }) =>
            tournamentsApi.addPlayerToTournament(tournamentId, playerId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(tournamentKeys.detail(variables.tournamentId), data);
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
        ...options,
    });
};

// Remove player from tournament mutation
export const useRemovePlayerFromTournament = (
    options?: UseMutationOptions<Tournament, Error, { tournamentId: string; playerId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tournamentId, playerId }) =>
            tournamentsApi.removePlayerFromTournament(tournamentId, playerId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(tournamentKeys.detail(variables.tournamentId), data);
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
        ...options,
    });
};