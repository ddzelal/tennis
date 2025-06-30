export const ENDPOINT = {
    USERS: '/users',
    USER: (id: string) => `/users/${id}`,

    PLAYERS: '/players',
    PLAYER: (id: string) => `/players/${id}`,

    TOURNAMENTS: '/tournaments',
    TOURNAMENT: (id: string) => `/tournaments/${id}`,

    MATCHES: `/matches`,
    MATCH: (id: string) => `/users/${id}`,

    STAGES: `/stages`,
    STAGE: (id: string) => `/stages/${id}`,
} as const;