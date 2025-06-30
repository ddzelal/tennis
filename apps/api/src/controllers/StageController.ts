import { Request, Response, RequestHandler } from 'express';
import { Stage, Tournament, Match } from '../models';
import mongoose from 'mongoose';

export const StageController = {
  // Get all stages
  getAllStages: (async (req: Request, res: Response) => {
    try {
      const { tournamentId } = req.query;

      const filter: any = {};
      if (tournamentId) filter.tournament = tournamentId;

      const stages = await Stage.find(filter)
        .sort({ order: 1 })
        .populate('tournament', 'name');

      res.status(200).json(stages);
    } catch (error) {
      console.error('Error getting stages:', error);
      res.status(500).json({ message: 'Error getting stages' });
    }
  }) as RequestHandler,

  // Get stage by ID
  getStageById: (async (req: Request, res: Response) => {
    try {
      const stage = await Stage.findById(req.params.id)
        .populate('tournament', 'name')
        .populate('players', 'name email ranking');
      
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }
      
      res.status(200).json(stage);
    } catch (error) {
      console.error('Error getting stage:', error);
      res.status(500).json({ message: 'Error getting stage' });
    }
  }) as RequestHandler,

  // Create a new stage
  createStage: (async (req: Request, res: Response) => {
    try {
      const { 
        tournament, 
        name, 
        type, 
        order,
        startDate, 
        endDate, 
        players,
        advancingPlayers,
        rules
      } = req.body;
      
      // Validate tournament exists
      const tournamentExists = await Tournament.exists({ _id: tournament });
      if (!tournamentExists) {
        return res.status(400).json({ message: 'Tournament not found' });
      }
      
      // Check if a stage with the same order already exists for this tournament
      const existingStage = await Stage.findOne({ 
        tournament, 
        order 
      });
      
      if (existingStage) {
        return res.status(400).json({ 
          message: `A stage with order ${order} already exists for this tournament` 
        });
      }
      
      const stage = new Stage({
        tournament,
        name,
        type,
        order,
        startDate,
        endDate,
        players: players || [],
        advancingPlayers,
        rules
      });
      
      await stage.save();
      
      res.status(201).json(stage);
    } catch (error) {
      console.error('Error creating stage:', error);
      res.status(500).json({ message: 'Error creating stage' });
    }
  }) as RequestHandler,

  // Update stage
  updateStage: (async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        type, 
        order,
        startDate, 
        endDate, 
        players,
        advancingPlayers,
        rules
      } = req.body;
      
      // If the order is being changed, check if a stage with the new order already exists
      if (order) {
        const stage = await Stage.findById(req.params.id);
        if (!stage) {
          return res.status(404).json({ message: 'Stage not found' });
        }
        
        if (stage.order !== order) {
          const existingStage = await Stage.findOne({ 
            tournament: stage.tournament, 
            order,
            _id: { $ne: req.params.id }
          });
          
          if (existingStage) {
            return res.status(400).json({ 
              message: `A stage with order ${order} already exists for this tournament` 
            });
          }
        }
      }
      
      const updatedStage = await Stage.findByIdAndUpdate(
        req.params.id,
        { 
          name, 
          type, 
          order,
          startDate, 
          endDate, 
          players,
          advancingPlayers,
          rules
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedStage) {
        return res.status(404).json({ message: 'Stage not found' });
      }
      
      res.status(200).json(updatedStage);
    } catch (error) {
      console.error('Error updating stage:', error);
      res.status(500).json({ message: 'Error updating stage' });
    }
  }) as RequestHandler,

  // Delete stage
  deleteStage: (async (req: Request, res: Response) => {
    try {
      // Delete the stage
      const stage = await Stage.findByIdAndDelete(req.params.id);
      
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }
      
      // Delete all matches associated with the stage
      await Match.deleteMany({ stage: req.params.id });
      
      res.status(200).json({ message: 'Stage and related matches deleted successfully' });
    } catch (error) {
      console.error('Error deleting stage:', error);
      res.status(500).json({ message: 'Error deleting stage' });
    }
  }) as RequestHandler,

  // Add player to stage
  addPlayerToStage: (async (req: Request, res: Response) => {
    try {
      const { playerId } = req.body;
      
      const stage = await Stage.findById(req.params.id);
      
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }
      
      // Check if player is already in the stage
      if (stage.players.includes(playerId)) {
        return res.status(400).json({ message: 'Player is already in this stage' });
      }
      
      stage.players.push(playerId);
      await stage.save();
      
      res.status(200).json(stage);
    } catch (error) {
      console.error('Error adding player to stage:', error);
      res.status(500).json({ message: 'Error adding player to stage' });
    }
  }) as RequestHandler,

  // Generate matches for a stage
  generateMatches: (async (req: Request, res: Response) => {
    try {
      const stage = await Stage.findById(req.params.id)
        .populate('tournament');
      
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }
      
      // Check if the stage has enough players
      if (!stage.players || stage.players.length < 2) {
        return res.status(400).json({ 
          message: 'Stage must have at least 2 players to generate matches' 
        });
      }
      
      // Generate matches based on a stage type
      const matches = [];
      
      if (stage.type === 'GROUP' || stage.type === 'ROUND_ROBIN') {
        // Round-robin: each player plays against every other player
        for (let i = 0; i < stage.players.length; i++) {
          for (let j = i + 1; j < stage.players.length; j++) {
            matches.push({
              tournament: stage.tournament._id,
              stage: stage._id,
              player1: stage.players[i],
              player2: stage.players[j],
              status: 'SCHEDULED'
            });
          }
        }
      } else if (stage.type === 'KNOCKOUT' || stage.type === 'SEMIFINALS' || stage.type === 'FINALS') {
        // Knockout: pair players sequentially
        for (let i = 0; i < stage.players.length; i += 2) {
          // If we have an odd number of players, the last one gets a bye
          if (i + 1 < stage.players.length) {
            matches.push({
              tournament: stage.tournament._id,
              stage: stage._id,
              player1: stage.players[i],
              player2: stage.players[i + 1],
              status: 'SCHEDULED'
            });
          }
        }
      }
      
      // Create all matches
      if (matches.length > 0) {
        await Match.insertMany(matches);
      }
      
      res.status(201).json({ 
        message: `${matches.length} matches generated successfully`,
        matchCount: matches.length
      });
    } catch (error) {
      console.error('Error generating matches:', error);
      res.status(500).json({ message: 'Error generating matches' });
    }
  }) as RequestHandler
};