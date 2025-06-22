import { Request, Response, RequestHandler } from 'express';
import { Player } from '../models';

export const PlayerController = {
  // Get all players
  getAllPlayers: (async (req: Request, res: Response) => {
    try {
      const players = await Player.find().sort({ name: 1 });
      res.status(200).json(players);
    } catch (error) {
      console.error('Error getting players:', error);
      res.status(500).json({ message: 'Error getting players' });
    }
  }) as RequestHandler,

  // Get player by ID
  getPlayerById: (async (req: Request, res: Response) => {
    try {
      const player = await Player.findById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      res.status(200).json(player);
    } catch (error) {
      console.error('Error getting player:', error);
      res.status(500).json({ message: 'Error getting player' });
    }
  }) as RequestHandler,

  // Create a new player
  createPlayer: (async (req: Request, res: Response) => {
    try {
      const { name, email, phone, ranking } = req.body;
      
      // Check if a player with email already exists
      const existingPlayer = await Player.findOne({ email });
      if (existingPlayer) {
        return res.status(400).json({ message: 'Player with this email already exists' });
      }
      
      const player = new Player({
        name,
        email,
        phone,
        ranking
      });
      
      await player.save();
      res.status(201).json(player);
    } catch (error) {
      console.error('Error creating player:', error);
      res.status(500).json({ message: 'Error creating player' });
    }
  }) as RequestHandler,

  // Update player
  updatePlayer: (async (req: Request, res: Response) => {
    try {
      const { name, email, phone, ranking } = req.body;
      
      // Check if email is being changed and if it already exists
      if (email) {
        const existingPlayer = await Player.findOne({ 
          email, 
          _id: { $ne: req.params.id } 
        });
        
        if (existingPlayer) {
          return res.status(400).json({ message: 'Player with this email already exists' });
        }
      }
      
      const player = await Player.findByIdAndUpdate(
        req.params.id,
        { name, email, phone, ranking },
        { new: true, runValidators: true }
      );
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      res.status(200).json(player);
    } catch (error) {
      console.error('Error updating player:', error);
      res.status(500).json({ message: 'Error updating player' });
    }
  }) as RequestHandler,

  // Delete player
  deletePlayer: (async (req: Request, res: Response) => {
    try {
      const player = await Player.findByIdAndDelete(req.params.id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ message: 'Error deleting player' });
    }
  }) as RequestHandler
};