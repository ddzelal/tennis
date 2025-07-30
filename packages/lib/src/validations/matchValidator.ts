import { z } from "zod";
import { PaginationQuerySchema } from "./commonValidator";

// Match status enum
export const MatchStatusSchema = z.enum([
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "POSTPONED"
]);

// Set schema for tennis matches
export const SetSchema = z.object({
    player1Games: z.number().int().min(0).max(7),
    player2Games: z.number().int().min(0).max(7),
    tiebreaker: z.object({
        player1Points: z.number().int().min(0).optional(),
        player2Points: z.number().int().min(0).optional()
    }).optional()
});

// Base match schema (without custom validation)
const BaseMatchSchema = z.object({
    tournament: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tournament ID format"),
    stage: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid stage ID format").optional(),
    player1: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid player1 ID format"),
    player2: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid player2 ID format"),
    scheduledDate: z.string().refine((date) => {
        const matchDate = new Date(date);
        return !isNaN(matchDate.getTime());
    }, "Scheduled date must be a valid date"),
    status: MatchStatusSchema.optional().default("SCHEDULED"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
});

// Create match schema with custom validation
export const CreateMatchSchema = BaseMatchSchema.refine(
    (data) => data.player1 !== data.player2,
    {
        message: "Player1 and Player2 must be different",
        path: ["players"]
    }
);

// Update match schema - partial of base schema + additional fields
export const UpdateMatchSchema = BaseMatchSchema.partial().extend({
    completedDate: z.string().refine((date) => {
        const matchDate = new Date(date);
        return !isNaN(matchDate.getTime());
    }, "Completed date must be a valid date").optional(),
    sets: z.array(SetSchema).min(1, "At least one set is required").max(5, "Maximum 5 sets allowed").optional(),
    winner: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid winner ID format").optional()
}).refine(
    (data) => {
        // Only validate player difference if both are provided
        if (data.player1 && data.player2) {
            return data.player1 !== data.player2;
        }
        return true;
    },
    {
        message: "Player1 and Player2 must be different",
        path: ["players"]
    }
);

// Record match result schema
export const RecordMatchResultSchema = z.object({
    sets: z.array(SetSchema).min(1, "At least one set is required").max(5, "Maximum 5 sets allowed"),
    winner: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid winner ID format")
});

// Match query schema for filtering
export const MatchQuerySchema = PaginationQuerySchema.extend({
    tournamentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tournament ID format").optional(),
    stageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid stage ID format").optional(),
    playerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid player ID format").optional(),
    status: MatchStatusSchema.optional(),
    round: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
    dateFrom: z.string().refine((date) => {
        const matchDate = new Date(date);
        return !isNaN(matchDate.getTime());
    }, "Date from must be a valid date").optional(),
    dateTo: z.string().refine((date) => {
        const matchDate = new Date(date);
        return !isNaN(matchDate.getTime());
    }, "Date to must be a valid date").optional()
});

// Advanced match search
export const MatchAdvancedSearchSchema = MatchQuerySchema.extend({
    sortBy: z.enum(['scheduledDate', 'completedDate', 'status', 'tournament']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Infer TypeScript types
export type CreateMatchData = z.infer<typeof CreateMatchSchema>;
export type UpdateMatchData = z.infer<typeof UpdateMatchSchema>;
export type RecordMatchResultData = z.infer<typeof RecordMatchResultSchema>;
export type MatchQueryParams = z.infer<typeof MatchQuerySchema>;
export type MatchAdvancedSearchParams = z.infer<typeof MatchAdvancedSearchSchema>;
export type SetData = z.infer<typeof SetSchema>;
export type MatchStatus = z.infer<typeof MatchStatusSchema>;