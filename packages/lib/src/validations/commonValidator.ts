import { z } from "zod";


export const MongoIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
});

export const PaginationQuerySchema = z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
    search: z.string().optional()
});

export type MongoIdParams = z.infer<typeof MongoIdSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
