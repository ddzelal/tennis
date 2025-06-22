import { Request, Response, RequestHandler } from 'express';
import { Tournament, Stage, Match } from '../models';
import mongoose from 'mongoose';

export const TournamentController = {
    // Get all tournaments
    getAllTournaments: (async (req: Request, res: Response) => {
        try {
            const tournaments = await Tournament.find()
                .sort({createdAt: -1})
                .populate('createdBy', 'name email');

            res.status(200).json(tournaments);
        } catch (error) {
            console.error('Error getting tournaments:', error);
            res.status(500).json({message: 'Error getting tournaments'});
        }
    }) as RequestHandler,

    // Get tournament by ID
    getTournamentById: (async (req: Request, res: Response) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('players', 'name email ranking')
                .populate('createdBy', 'name email');

            if (!tournament) {
                return res.status(404).json({message: 'Tournament not found'});
            }

            res.status(200).json(tournament);
        } catch (error) {
            console.error('Error getting tournament:', error);
            res.status(500).json({message: 'Error getting tournament'});
        }
    }) as RequestHandler,

    // Create a new tournament
    createTournament: (async (req: Request, res: Response) => {
        try {
            const { name, description, type, startDate, endDate, players, maxPlayers, rules } = req.body;
            
            if (!name || typeof name !== 'string') {
                return res.status(400).json({ message: 'Name is required and must be a string' });
            }
            
            const createdBy = req.body.createdBy || '000000000000000000000000';
            
            const tournament = new Tournament({
                name,
                description,
                type,
                startDate,
                endDate,
                players: players || [],
                maxPlayers,
                rules,
                createdBy,
                status: 'DRAFT'
            });
            
            await tournament.save();
            
            res.status(201).json(tournament);
        } catch (error) {
            console.error('Error creating tournament:', error);
            res.status(500).json({ message: 'Error creating tournament' });
        }
    }) as RequestHandler,

    // Update tournament
    updateTournament: (async (req: Request, res: Response) => {
        try {
            const {
                name,
                description,
                type,
                status,
                startDate,
                endDate,
                players,
                maxPlayers,
                rules
            } = req.body;

            const tournament = await Tournament.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    type,
                    status,
                    startDate,
                    endDate,
                    players,
                    maxPlayers,
                    rules
                },
                {new: true, runValidators: true}
            );

            if (!tournament) {
                return res.status(404).json({message: 'Tournament not found'});
            }

            res.status(200).json(tournament);
        } catch (error) {
            console.error('Error updating tournament:', error);
            res.status(500).json({message: 'Error updating tournament'});
        }
    }) as RequestHandler,

    // Delete tournament
    deleteTournament: (async (req: Request, res: Response) => {
        try {
            const tournament = await Tournament.findByIdAndDelete(req.params.id);

            if (!tournament) {
                return res.status(404).json({message: 'Tournament not found'});
            }

            // Delete related data
            await Stage.deleteMany({tournament: req.params.id});
            await Match.deleteMany({tournament: req.params.id});

            res.status(200).json({message: 'Tournament and related data deleted successfully'});
        } catch (error) {
            console.error('Error deleting tournament:', error);
            res.status(500).json({message: 'Error deleting tournament'});
        }
    }) as RequestHandler,

    // Add player to tournament
    addPlayerToTournament: (async (req: Request, res: Response) => {
        try {
            const { playerId } = req.body;

            if (!mongoose.Types.ObjectId.isValid(playerId)) {
                return res.status(400).json({ message: 'Invalid player ID' });
            }

            const tournament = await Tournament.findById(req.params.id);

            if (!tournament) {
                return res.status(404).json({ message: 'Tournament not found' });
            }

            if (tournament.maxPlayers && tournament.players.length >= tournament.maxPlayers) {
                return res.status(400).json({ message: 'Tournament is full' });
            }

            const updatedTournament = await Tournament.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { players: playerId } },
                { new: true, runValidators: true }
            );

            res.status(200).json(updatedTournament);
        } catch (error) {
            console.error('Error adding player to tournament:', error);
            res.status(500).json({ message: 'Error adding player to tournament' });
        }
    }) as RequestHandler,

    // Remove player from the tournament
    removePlayerFromTournament: (async (req: Request, res: Response) => {
        try {
            const { playerId } = req.body;

            if (!mongoose.Types.ObjectId.isValid(playerId)) {
                return res.status(400).json({ message: 'Invalid player ID' });
            }

            const tournament = await Tournament.findByIdAndUpdate(
                req.params.id,
                { $pull: { players: playerId } },
                { new: true, runValidators: true }
            );

            if (!tournament) {
                return res.status(404).json({ message: 'Tournament not found' });
            }

            res.status(200).json(tournament);
        } catch (error) {
            console.error('Error removing player from tournament:', error);
            res.status(500).json({ message: 'Error removing player from tournament' });
        }
    }) as RequestHandler,
};