import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import { playersApi } from '../api';
import {CreatePlayerData, PaginatedResponse, Player, PlayerQueryParams, UpdatePlayerData} from "@repo/lib";


// Query keys
export const playerKeys = {
    all: ['players'] as const,
    lists: () => [...playerKeys.all, 'list'] as const,
    list: (params: PlayerQueryParams) => [...playerKeys.lists(), params] as const,
    details: () => [...playerKeys.all, 'detail'] as const,
    detail: (id: string) => [...playerKeys.details(), id] as const,
};

// Get players with pagination and search
export const useGetPlayers = (
    params: PlayerQueryParams = {},
    options?: UseQueryOptions<PaginatedResponse<Player>>
) => {
    return useQuery({
        queryKey: playerKeys.list(params),
        queryFn: () => playersApi.getPlayers(params),
        ...options,
    });
};

// Get a single player
export const useGetPlayer = (
    id: string,
    options?: UseQueryOptions<Player>
) => {
    return useQuery({
        queryKey: playerKeys.detail(id),
        queryFn: () => playersApi.getPlayer(id),
        enabled: !!id,
        ...options,
    });
};

// Create a player mutation
export const useCreatePlayer = (
    options?: UseMutationOptions<Player, Error, CreatePlayerData>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: playersApi.createPlayer,
        onSuccess: () => {
            // Invalidate and refetch players list
            queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
        },
        ...options,
    });
};

// Update player mutation
export const useUpdatePlayer = (
    options?: UseMutationOptions<Player, Error, { id: string; data: UpdatePlayerData }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => playersApi.updatePlayer(id, data),
        onSuccess: (data, variables) => {
            // Update the specific player in cache
            queryClient.setQueryData(playerKeys.detail(variables.id), data);
            // Invalidate player list to refresh
            queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
        },
        ...options,
    });
};

// Delete player mutation
export const useDeletePlayer = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: playersApi.deletePlayer,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: playerKeys.detail(deletedId) });
            // Invalidate lists to refresh
            queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
        },
        ...options,
    });
};