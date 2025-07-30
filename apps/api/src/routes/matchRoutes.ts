import express, { Router } from "express";
import { MatchController } from "../controllers";
import { validate } from "../middleware/requestValidationHandler";
import {
    CreateMatchSchema,
    UpdateMatchSchema,
    RecordMatchResultSchema,
    MatchQuerySchema,
    MongoIdSchema
} from "@repo/lib";

const router: Router = express.Router();

// GET /api/matches - Get all matches with filtering
router.get("/",
    validate({ query: MatchQuerySchema }),
    MatchController.getAllMatches
);

// GET /api/matches/:id - Get match by ID
router.get("/:id",
    validate({ params: MongoIdSchema }),
    MatchController.getMatchById
);

// POST /api/matches - Create a new match
router.post("/",
    validate({ body: CreateMatchSchema }),
    MatchController.createMatch
);

// PUT /api/matches/:id - Update match
router.put("/:id",
    validate({
        params: MongoIdSchema,
        body: UpdateMatchSchema
    }),
    MatchController.updateMatch
);

// DELETE /api/matches/:id - Delete match
router.delete("/:id",
    validate({ params: MongoIdSchema }),
    MatchController.deleteMatch
);

// POST /api/matches/:id/result - Record match result
router.post("/:id/result",
    validate({
        params: MongoIdSchema,
        body: RecordMatchResultSchema
    }),
    MatchController.recordMatchResult
);

export default router;