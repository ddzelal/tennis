import { Request, Response, RequestHandler } from 'express';
import { Player } from '../models';
import { ResponseHelper, PaginationHelper } from '../lib/utils/responseHandler';
import { ValidationError } from '../types/response';

export const PlayerController = {
  // Get all players with optional search and pagination
  getAllPlayers: (async (req: Request, res: Response) => {
    try {
      // Extract query parameters
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Build a search query
      let query: any = {};
      if (search && search.trim()) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }

      // Count total documents
      const total = await Player.countDocuments(query);

      // Get paginated results
      const skip = PaginationHelper.getSkipValue(page, limit);
      const players = await Player.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      // Calculate pagination data
      const pagination = PaginationHelper.calculatePagination(page, limit, total);

      // Return paginated response
      return ResponseHelper.paginatedSuccess(
        res,
        players,
        pagination,
        `Found ${total} player(s)`
      );

    } catch (error) {
      console.error('Error getting players:', error);
      return ResponseHelper.internalError(res, 'Error getting players');
    }
  }) as RequestHandler,

  // Get player by ID
  getPlayerById: (async (req: Request, res: Response) => {
    try {
      const player = await Player.findById(req.params.id);

      if (!player) {
        return ResponseHelper.notFound(res, 'Player');
      }

      return ResponseHelper.success(res, player, 'Player retrieved successfully');

    } catch (error) {
      console.error('Error getting player:', error);

      // Handle invalid ObjectId
      if (error instanceof Error && error.name === 'CastError') {
        return ResponseHelper.badRequest(res, 'Invalid player ID format');
      }

      return ResponseHelper.internalError(res, 'Error getting player');
    }
  }) as RequestHandler,

  // Create a new player
  createPlayer: (async (req: Request, res: Response) => {
    try {
      const { name, email, phone, ranking } = req.body;
      
      // Validation
      const validationErrors: ValidationError[] = [];
      
      if (!name || name.trim() === '') {
        validationErrors.push({ field: 'name', message: 'Name is required' });
      }
      
      if (!email || email.trim() === '') {
        validationErrors.push({ field: 'email', message: 'Email is required' });
      }
      
      if (ranking && (isNaN(ranking) || ranking < 1)) {
        validationErrors.push({ field: 'ranking', message: 'Ranking must be a positive number' });
      }
      
      if (validationErrors.length > 0) {
        return ResponseHelper.badRequest(res, 'Validation failed', validationErrors);
      }
      
      // Check if player with email already exists
      const existingPlayer = await Player.findOne({ email: email.trim() });
      if (existingPlayer) {
        return ResponseHelper.conflict(res, 'Player with this email already exists');
      }
      
      // Create new player
      const player = new Player({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim(),
        ranking
      });
      
      await player.save();
      
      return ResponseHelper.created(res, player, 'Player created successfully');
      
    } catch (error) {
      console.error('Error creating player:', error);
      return ResponseHelper.internalError(res, 'Error creating player');
    }
  }) as RequestHandler,

  // Update player
  updatePlayer: (async (req: Request, res: Response) => {
    try {
      const { name, email, phone, ranking } = req.body;
      
      // Validation
      const validationErrors: ValidationError[] = [];
      
      if (name !== undefined && (!name || name.trim() === '')) {
        validationErrors.push({ field: 'name', message: 'Name cannot be empty' });
      }
      
      if (email !== undefined && (!email || email.trim() === '')) {
        validationErrors.push({ field: 'email', message: 'Email cannot be empty' });
      }
      
      if (ranking !== undefined && (isNaN(ranking) || ranking < 1)) {
        validationErrors.push({ field: 'ranking', message: 'Ranking must be a positive number' });
      }
      
      if (validationErrors.length > 0) {
        return ResponseHelper.badRequest(res, 'Validation failed', validationErrors);
      }
      
      // Check if email is being changed and already exists
      if (email) {
        const existingPlayer = await Player.findOne({ 
          email: email.trim(), 
          _id: { $ne: req.params.id } 
        });
        
        if (existingPlayer) {
          return ResponseHelper.conflict(res, 'Player with this email already exists');
        }
      }
      
      // Update player
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.trim();
      if (phone !== undefined) updateData.phone = phone?.trim();
      if (ranking !== undefined) updateData.ranking = ranking;
      
      const player = await Player.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!player) {
        return ResponseHelper.notFound(res, 'Player');
      }
      
      return ResponseHelper.success(res, player, 'Player updated successfully');
      
    } catch (error) {
      console.error('Error updating player:', error);
      
      if (error instanceof Error && error.name === 'CastError') {
        return ResponseHelper.badRequest(res, 'Invalid player ID format');
      }
      
      return ResponseHelper.internalError(res, 'Error updating player');
    }
  }) as RequestHandler,

  // Delete player
  deletePlayer: (async (req: Request, res: Response) => {
    try {
      const player = await Player.findByIdAndDelete(req.params.id);
      
      if (!player) {
        return ResponseHelper.notFound(res, 'Player');
      }
      
      return ResponseHelper.success(res, null, 'Player deleted successfully');
      
    } catch (error) {
      console.error('Error deleting player:', error);
      
      if (error instanceof Error && error.name === 'CastError') {
        return ResponseHelper.badRequest(res, 'Invalid player ID format');
      }
      
      return ResponseHelper.internalError(res, 'Error deleting player');
    }
  }) as RequestHandler
};