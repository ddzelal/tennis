export interface Player {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ranking?: number;
    fullName?: string;
    age?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlayerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ranking?: number;
}

export interface UpdatePlayerData {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    ranking?: number;
}

export interface PlayerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    minRanking?: number;
    maxRanking?: number;
}

// Backend interface (extends Document)
export interface IPlayerDocument {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    ranking?: number;
    createdAt: Date;
    updatedAt: Date;
}