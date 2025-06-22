export const queryKeys = {
    users: ['users'] as const,
    user: (id: string) => ['users', id] as const,
    posts: ['posts'] as const,
    post: (id: string) => ['posts', id] as const,
    userPosts: (userId: string) => ['users', userId, 'posts'] as const,
}