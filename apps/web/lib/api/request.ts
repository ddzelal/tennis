import { StandardResponse, ErrorResponse, PaginatedResponse } from '../types/global';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
    status: number;
    validationErrors?: Array<{ field: string; message: string }>;

    constructor(message: string, status: number, validationErrors?: Array<{ field: string; message: string }>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        if (!response.ok) {
            // Handle standardized error response
            const errorResponse = responseData as ErrorResponse;
            throw new ApiError(
                errorResponse.error || `HTTP error! status: ${response.status}`,
                response.status,
                errorResponse.validationErrors
            );
        }

        return responseData as T;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
        throw new ApiError(
            error instanceof Error ? error.message : 'Unknown error occurred',
            0
        );
    }
}

// 🔧 Posebna funkcija za single objekti
async function apiRequestSingle<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        if (!response.ok) {
            const errorResponse = responseData as ErrorResponse;
            throw new ApiError(
                errorResponse.error || `HTTP error! status: ${response.status}`,
                response.status,
                errorResponse.validationErrors
            );
        }

        const standardResponse = responseData as StandardResponse<T>;
        return standardResponse.data || responseData;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error instanceof Error ? error.message : 'Unknown error occurred',
            0
        );
    }
}

export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiRequest<T>(endpoint, { method: 'GET', ...options }),

    getSingle: <T>(endpoint: string, options?: RequestInit) =>
        apiRequestSingle<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequestSingle<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        }),

    put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequestSingle<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiRequestSingle<T>(endpoint, { method: 'DELETE', ...options }),
};

export { ApiError };