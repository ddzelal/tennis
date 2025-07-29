import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { playersApi } from "../api";
import {
  CreatePlayerData,
  UpdatePlayerData,
  PlayerQueryParams,
  // Import response types
  GetAllPlayersResponse,
  GetPlayerByIdResponse,
  CreatePlayerResponse,
  UpdatePlayerResponse,
  DeletePlayerResponse,
} from "@repo/lib";

// Query keys
export const playerKeys = {
  all: ["players"] as const,
  lists: () => [...playerKeys.all, "list"] as const,
  list: (params: PlayerQueryParams) => [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, "detail"] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
};

// Get players with pagination and search
export const useGetPlayers = (
  params: PlayerQueryParams = {},
  options?: UseQueryOptions<GetAllPlayersResponse>,
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
  options?: UseQueryOptions<GetPlayerByIdResponse>,
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
  options?: UseMutationOptions<CreatePlayerResponse, Error, CreatePlayerData>,
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
  options?: UseMutationOptions<
    UpdatePlayerResponse,
    Error,
    { id: string; data: UpdatePlayerData }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => playersApi.updatePlayer(id, data),
    onSuccess: (response, variables) => {
      // Update the specific player in cache
      queryClient.setQueryData(playerKeys.detail(variables.id), response);
      // Invalidate player list to refresh
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
    ...options,
  });
};

// Delete player mutation
export const useDeletePlayer = (
  options?: UseMutationOptions<DeletePlayerResponse, Error, string>,
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
