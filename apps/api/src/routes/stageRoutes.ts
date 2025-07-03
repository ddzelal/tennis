import express, { Router } from 'express';
import { StageController } from '../controllers';

const router: Router = express.Router();

// GET /api/stages - Get all stages
router.get('/', StageController.getAllStages);

// GET /api/stages/:id - Get stage by ID
router.get('/:id', StageController.getStageById);

// POST /api/stages - Create a new stage
router.post('/', StageController.createStage);

// PUT /api/stages/:id - Update stage
router.put('/:id', StageController.updateStage);

// DELETE /api/stages/:id - Delete stage
router.delete('/:id', StageController.deleteStage);

// POST /api/stages/:id/players - Add player to stage
router.post('/:id/players', StageController.addPlayerToStage);

// DELETE /api/stages/:id/players/:playerId - Remove player from stage
router.delete('/:id/players/:playerId', StageController.removePlayerFromStage);

// POST /api/stages/:id/generate-matches - Generate matches for a stage
router.post('/:id/generate-matches', StageController.generateMatches);

export default router;