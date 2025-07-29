import express, { Router } from "express";
import { PlayerController } from "../controllers";
import { validate } from "../middleware/requestValidationHandler";
import {
    CreatePlayerSchema,
    UpdatePlayerSchema,
    MongoIdSchema,
    PaginationQuerySchema
} from "@repo/lib";

const router: Router = express.Router();

// GET /api/players - Get all players with pagination and search
router.get("/",
    validate({ query: PaginationQuerySchema }),
    PlayerController.getAllPlayers
);

// GET /api/players/:id - Get player by ID
router.get("/:id",
    validate({ params: MongoIdSchema }),
    PlayerController.getPlayerById
);

// POST /api/players - Create new player
router.post("/",
    validate({ body: CreatePlayerSchema }),
    PlayerController.createPlayer
);

// PUT /api/players/:id - Update player
router.put("/:id",
    validate({
        params: MongoIdSchema,
        body: UpdatePlayerSchema
    }),
    PlayerController.updatePlayer
);

// DELETE /api/players/:id - Delete player
router.delete("/:id",
    validate({ params: MongoIdSchema }),
    PlayerController.deletePlayer
);

export default router;