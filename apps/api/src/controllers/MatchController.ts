import { Request, RequestHandler, Response } from 'express';
import { Match, Tournament, Player, MatchStatus } from '../models';

export const MatchController = {
  // Get all matches
  getAllMatches: (async (req: Request, res: Response) => {
    try {
      const { tournamentId, stageId, playerId, status } = req.query;
      
      // Build a filter object based on query parameters
      const filter: any = {};
      
      if (tournamentId) filter.tournament = tournamentId;
      if (stageId) filter.stage = stageId;
      if (status) filter.status = status;
      if (playerId) {
        filter.$or = [
          { player1: playerId },
          { player2: playerId }
        ];
      }
      
      const matches = await Match.find(filter)
        .sort({ scheduledDate: 1 })
        .populate('player1', 'name')
        .populate('player2', 'name')
        .populate('winner', 'name')
        .populate('tournament', 'name');
      
      res.status(200).json(matches);
    } catch (error) {
      console.error('Error getting matches:', error);
      res.status(500).json({ message: 'Error getting matches' });
    }
  }) as RequestHandler,

  // Get match by ID
  getMatchById: (async (req: Request, res: Response) => {
    try {
      const match = await Match.findById(req.params.id)
        .populate('player1', 'name email ranking')
        .populate('player2', 'name email ranking')
        .populate('winner', 'name')
        .populate('tournament', 'name')
        .populate('stage', 'name type');
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      res.status(200).json(match);
    } catch (error) {
      console.error('Error getting match:', error);
      res.status(500).json({ message: 'Error getting match' });
    }
  }) as RequestHandler,

  // Create a new match
  createMatch: (async (req: Request, res: Response) => {
    try {
      const { 
        tournament, 
        stage, 
        player1, 
        player2, 
        scheduledDate,
        status
      } = req.body;
      
      // Validate tournament exists
      const tournamentExists = await Tournament.exists({ _id: tournament });
      if (!tournamentExists) {
        return res.status(400).json({ message: 'Tournament not found' });
      }
      
      // Validate players exist
      const player1Exists = await Player.exists({ _id: player1 });
      const player2Exists = await Player.exists({ _id: player2 });
      
      if (!player1Exists || !player2Exists) {
        return res.status(400).json({ message: 'One or both players not found' });
      }
      
      // Validate players are different
      if (player1 === player2) {
        return res.status(400).json({ message: 'Players must be different' });
      }
      
      const match = new Match({
        tournament,
        stage,
        player1,
        player2,
        scheduledDate,
        status: status || 'SCHEDULED',
        sets: []
      });
      
      await match.save();
      
      res.status(201).json(match);
    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({ message: 'Error creating match' });
    }
  }) as RequestHandler,

  // Update match
  updateMatch: (async (req: Request, res: Response) => {
    try {
      const { 
        tournament, 
        stage, 
        player1, 
        player2, 
        scheduledDate,
        completedDate,
        status,
        sets,
        winner,
        notes
      } = req.body;
      
      // If players are being updated, validate they are different
      if (player1 && player2 && player1 === player2) {
        return res.status(400).json({ message: 'Players must be different' });
      }
      
      const match = await Match.findByIdAndUpdate(
        req.params.id,
        { 
          tournament, 
          stage, 
          player1, 
          player2, 
          scheduledDate,
          completedDate,
          status,
          sets,
          winner,
          notes
        },
        { new: true, runValidators: true }
      );
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      res.status(200).json(match);
    } catch (error) {
      console.error('Error updating match:', error);
      res.status(500).json({ message: 'Error updating match' });
    }
  }) as RequestHandler,

  // Delete match
  deleteMatch: (async (req: Request, res: Response) => {
    try {
      const match = await Match.findByIdAndDelete(req.params.id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
      console.error('Error deleting match:', error);
      res.status(500).json({ message: 'Error deleting match' });
    }
  }) as RequestHandler,

  // Record match result
  recordMatchResult: (async (req: Request, res: Response) => {
    try {
      const { sets, winner } = req.body;
      
      // Validate sets data
      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        return res.status(400).json({ message: 'Sets data is required' });
      }
      
      // Find the match
      const match = await Match.findById(req.params.id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Update match with results
      match.sets = sets;
      match.winner = winner;
      match.status = MatchStatus.COMPLETED;
      match.completedDate = new Date();
      
      await match.save();
      
      res.status(200).json(match);
    } catch (error) {
      console.error('Error recording match result:', error);
      res.status(500).json({ message: 'Error recording match result' });
    }
  }) as RequestHandler
};