export enum UserRole {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN'
}

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: string
    updatedAt: string
}

export interface CreateUserData {
    name: string
    email: string
}

export interface UpdateUserData {
    name?: string
    email?: string
}

export interface LoginUserData {
    email: string
    password: string
}