import express, { Router } from "express";
import { PlayerController } from "../controllers";

const router: Router = express.Router();

// GET /api/players - Get all players
router.get("/", PlayerController.getAllPlayers);

// GET /api/players/:id - Get player by ID
router.get("/:id", PlayerController.getPlayerById);

// POST /api/players - Create new player
router.post("/", PlayerController.createPlayer);

// PUT /api/players/:id - Update player
router.put("/:id", PlayerController.updatePlayer);

// DELETE /api/players/:id - Delete player
router.delete("/:id", PlayerController.deletePlayer);

export default router;
