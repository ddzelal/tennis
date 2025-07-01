import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/request'
import {queryKeys} from "../constants/query-keys";
import {CreateUserData, UpdateUserData, User, ENDPOINT} from "@repo/lib";



function useUsers() {
    return useQuery({
        queryKey: queryKeys.users,
        queryFn: () => api.get<User[]>(ENDPOINT.USERS),
    })
}

function useUser(id: string) {
    return useQuery({
        queryKey: queryKeys.user(id),
        queryFn: () => api.get<User>(ENDPOINT.USER(id)),
        enabled: !!id,
    })
}

function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserData) => api.post<User>(ENDPOINT.USERS, data),
        onSuccess: () => {
            // Invalidate users list da se refresh-uje
            queryClient.invalidateQueries({ queryKey: queryKeys.users })
        },
    })
}

function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
            api.put<User>(ENDPOINT.USER(id), data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(queryKeys.user(updatedUser.id), updatedUser)
            queryClient.invalidateQueries({ queryKey: queryKeys.users })
        },
    })
}

function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.delete(ENDPOINT.USER(id)),
        onSuccess: (_, deletedId) => {
            queryClient.removeQueries({ queryKey: queryKeys.user(deletedId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.users })
        },
    })
}


export {
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
}