const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status
        )
    }

    return response.json()
}

export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiRequest<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        }),

    put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
}