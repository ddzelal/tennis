import { z } from "zod";
import { PaginationQuerySchema } from "./commonValidator";

// Player-specific schemas
export const CreatePlayerSchema = z.object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    dateOfBirth: z.string().refine((date) => {
        const birthDate = new Date(date);
        return !isNaN(birthDate.getTime()) && birthDate < new Date();
    }, "Date of birth must be a valid date in the past"),
    ranking: z.number()
        .int()
        .min(1, "Ranking must be at least 1")
        .max(10000, "Ranking must be at most 10000")
        .optional()
});

export const UpdatePlayerSchema = CreatePlayerSchema.partial();

// Player advanced search - extends common pagination
export const PlayerAdvancedSearchSchema = PaginationQuerySchema.extend({
    minRanking: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
    maxRanking: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
    sortBy: z.enum(['firstName', 'lastName', 'ranking', 'dateOfBirth']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});

// Optional: Bulk operations
export const BulkCreatePlayersSchema = z.object({
    players: z.array(CreatePlayerSchema).min(1, "At least one player is required")
});

// Infer TypeScript types
export type CreatePlayerData = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerData = z.infer<typeof UpdatePlayerSchema>;
export type PlayerAdvancedSearchParams = z.infer<typeof PlayerAdvancedSearchSchema>;