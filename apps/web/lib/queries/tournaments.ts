import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import { tournamentsApi } from '../api';
import {
    CreateTournamentData,
    PaginatedResponse,
    Tournament,
    TournamentQueryParams,
    UpdateTournamentData
} from "@repo/lib";


// Query keys - BOLJA STRUKTURA
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

// Get a single tournament
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

export const useCreateTournament = (
    options?: UseMutationOptions<Tournament, Error, CreateTournamentData>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTournamentData) => {
            return tournamentsApi.createTournament(data);
        },
        onSuccess: async (newTournament: Tournament, variables: CreateTournamentData, context?: any) => {
            try {
                await queryClient.invalidateQueries({
                    queryKey: tournamentKeys.all
                });

                await queryClient.refetchQueries({
                    queryKey: tournamentKeys.lists(),
                    type: 'active'
                });

                if (options?.onSuccess) {
                    options.onSuccess(newTournament, variables, context);
                }
                
            } catch (error) {
                console.error('❌ Error in onSuccess:', error);
            }
        },
        onError: (error: Error, variables: CreateTournamentData, context?: any) => {
            console.error('❌ CREATE ERROR:', error);
            if (options?.onError) {
                options.onError(error, variables, context);
            }
        },
        mutationKey: options?.mutationKey,
        meta: options?.meta,
        networkMode: options?.networkMode,
        retry: options?.retry,
        retryDelay: options?.retryDelay,
    });
};

export const useUpdateTournament = (
    options?: UseMutationOptions<Tournament, Error, { id: string; data: UpdateTournamentData }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTournamentData }) => {
            return tournamentsApi.updateTournament(id, data);
        },
        onSuccess: async (updatedTournament: Tournament, variables: { id: string; data: UpdateTournamentData }, context?: any) => {

            try {
                queryClient.setQueryData(tournamentKeys.detail(variables.id), updatedTournament);
                
                await queryClient.invalidateQueries({
                    queryKey: tournamentKeys.all
                });

                await queryClient.refetchQueries({
                    queryKey: tournamentKeys.lists(),
                    type: 'active'
                });

                if (options?.onSuccess) {
                    options.onSuccess(updatedTournament, variables, context);
                }
                
            } catch (error) {
                console.error('❌ Error in UPDATE onSuccess:', error);
            }
        },
        onError: (error: Error, variables: { id: string; data: UpdateTournamentData }, context?: any) => {
            console.error('❌ UPDATE ERROR:', error);
            if (options?.onError) {
                options.onError(error, variables, context);
            }
        },
        mutationKey: options?.mutationKey,
        meta: options?.meta,
        networkMode: options?.networkMode,
        retry: options?.retry,
        retryDelay: options?.retryDelay,
    });
};

export const useDeleteTournament = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tournamentsApi.deleteTournament,
        onSuccess: (_, deletedId) => {
            queryClient.removeQueries({
                queryKey: tournamentKeys.detail(deletedId) 
            });
            
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.lists(),
                exact: false 
            });
        },
        ...options,
    });
};

export const useAddPlayerToTournament = (
    options?: UseMutationOptions<Tournament, Error, { tournamentId: string; playerId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tournamentId, playerId }) =>
            tournamentsApi.addPlayerToTournament(tournamentId, playerId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(tournamentKeys.detail(variables.tournamentId), data);
            queryClient.invalidateQueries({ 
                queryKey: tournamentKeys.lists(),
                exact: false 
            });
        },
        ...options,
    });
};

export const useRemovePlayerFromTournament = (
    options?: UseMutationOptions<Tournament, Error, { tournamentId: string; playerId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tournamentId, playerId }) =>
            tournamentsApi.removePlayerFromTournament(tournamentId, playerId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(tournamentKeys.detail(variables.tournamentId), data);
            queryClient.invalidateQueries({ 
                queryKey: tournamentKeys.lists(),
                exact: false 
            });
        },
        ...options,
    });
};