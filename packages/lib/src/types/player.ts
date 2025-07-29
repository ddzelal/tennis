import { PaginatedResponse, StandardResponse } from "./api";

export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ranking?: number;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
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

// Player Controller Response Types
export type GetAllPlayersResponse = PaginatedResponse<Player>;
export type GetPlayerByIdResponse = StandardResponse<Player>;
export type CreatePlayerResponse = StandardResponse<Player>;
export type UpdatePlayerResponse = StandardResponse<Player>;
export type DeletePlayerResponse = StandardResponse<null>;
