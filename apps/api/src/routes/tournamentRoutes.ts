import express, { Router } from 'express';
import { TournamentController } from '../controllers';

const router: Router = express.Router();

// GET /api/tournaments - Get all tournaments
router.get('/', TournamentController.getAllTournaments);

// GET /api/tournaments/:id - Get tournament by ID
router.get('/:id', TournamentController.getTournamentById);

// GET /api/tournaments/:id/players - Get players in a tournament
router.get('/:id/players', TournamentController.getPlayersInTournament);

// POST /api/tournaments - Create a new tournament
router.post('/', TournamentController.createTournament);

// PUT /api/tournaments/:id - Update tournament
router.put('/:id', TournamentController.updateTournament);

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', TournamentController.deleteTournament);

// POST /api/tournaments/:id/players - Add player to tournament
router.post('/:id/players', TournamentController.addPlayerToTournament);

// DELETE /api/tournaments/:id/players - Remove player from tournament
router.delete('/:id/players', TournamentController.removePlayerFromTournament);

export default router;