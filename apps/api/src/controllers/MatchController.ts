import { Request, RequestHandler, Response } from "express";
import { Match, Tournament, Player } from "../models";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { ValidationError } from "@repo/lib";
import { MatchStatus } from "@repo/lib";

export const MatchController = {
  // Get all matches
  getAllMatches: (async (req: Request, res: Response): Promise<void> => {
    try {
      const { tournamentId, stageId, playerId, status } = req.query;
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Build a filter object
      const filter: any = {};

      if (tournamentId) filter.tournament = tournamentId;
      if (stageId) filter.stage = stageId;
      if (status) filter.status = status;
      if (playerId) {
        filter.$or = [{ player1: playerId }, { player2: playerId }];
      }

      const total = await Match.countDocuments(filter);
      const skip = PaginationHelper.getSkipValue(page, limit);

      const matches = await Match.find(filter)
        .sort({ scheduledDate: 1 })
        .populate("player1", "firstName lastName ranking")
        .populate("player2", "firstName lastName ranking")
        .populate("winner", "firstName lastName")
        .populate("tournament", "name")
        .skip(skip)
        .limit(limit);

      const pagination = PaginationHelper.calculatePagination(
        page,
        limit,
        total,
      );

      ResponseHelper.paginatedSuccess(
        res,
        matches,
        pagination,
        `Found ${total} match(es)`,
      );
    } catch (error) {
      console.error("Error getting matches:", error);
      ResponseHelper.internalError(res, "Error getting matches");
    }
  }) as RequestHandler,

  // Get match by ID
  getMatchById: (async (req: Request, res: Response): Promise<void> => {
    try {
      const match = await Match.findById(req.params.id)
        .populate("player1", "firstName lastName ranking")
        .populate("player2", "firstName lastName ranking")
        .populate("winner", "firstName lastName")
        .populate("tournament", "name")
        .populate("stage", "name type");

      if (!match) {
        ResponseHelper.notFound(res, "Match");
        return;
      }

      ResponseHelper.success(res, match, "Match retrieved successfully");
    } catch (error) {
      console.error("Error getting match:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid match ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error getting match");
    }
  }) as RequestHandler,

  // Create a new match
  createMatch: (async (req: Request, res: Response): Promise<void> => {
    try {
      const { tournament, stage, player1, player2, scheduledDate, status } =
        req.body;

      const validationErrors: ValidationError[] = [];

      if (!tournament) {
        validationErrors.push({
          field: "tournament",
          message: "Tournament is required",
        });
      }

      if (!player1) {
        validationErrors.push({
          field: "player1",
          message: "Player 1 is required",
        });
      }

      if (!player2) {
        validationErrors.push({
          field: "player2",
          message: "Player 2 is required",
        });
      }

      if (player1 === player2) {
        validationErrors.push({
          field: "players",
          message: "Players must be different",
        });
      }

      if (validationErrors.length > 0) {
        ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        return;
      }

      // Validate tournament exists
      const tournamentExists = await Tournament.exists({ _id: tournament });
      if (!tournamentExists) {
        ResponseHelper.badRequest(res, "Tournament not found");
        return;
      }

      // Validate players exist
      const player1Exists = await Player.exists({ _id: player1 });
      const player2Exists = await Player.exists({ _id: player2 });

      if (!player1Exists || !player2Exists) {
        ResponseHelper.badRequest(res, "One or both players not found");
        return;
      }

      const match = new Match({
        tournament,
        stage,
        player1,
        player2,
        scheduledDate,
        status: status || "SCHEDULED",
        sets: [],
      });

      await match.save();

      // ✅ POPULATE NAKON SAVE
      const populatedMatch = await Match.findById(match._id)
        .populate("player1", "firstName lastName ranking")
        .populate("player2", "firstName lastName ranking")
        .populate("tournament", "name");

      ResponseHelper.created(res, populatedMatch, "Match created successfully");
    } catch (error) {
      console.error("Error creating match:", error);
      ResponseHelper.internalError(res, "Error creating match");
    }
  }) as RequestHandler,

  // Update match
  updateMatch: (async (req: Request, res: Response): Promise<void> => {
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
        notes,
      } = req.body;

      // Validate players are different if both provided
      if (player1 && player2 && player1 === player2) {
        ResponseHelper.badRequest(res, "Players must be different");
        return;
      }

      const updateData: any = {};
      if (tournament !== undefined) updateData.tournament = tournament;
      if (stage !== undefined) updateData.stage = stage;
      if (player1 !== undefined) updateData.player1 = player1;
      if (player2 !== undefined) updateData.player2 = player2;
      if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
      if (completedDate !== undefined) updateData.completedDate = completedDate;
      if (status !== undefined) updateData.status = status;
      if (sets !== undefined) updateData.sets = sets;
      if (winner !== undefined) updateData.winner = winner;
      if (notes !== undefined) updateData.notes = notes;

      const match = await Match.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("player1", "firstName lastName ranking")
        .populate("player2", "firstName lastName ranking")
        .populate("winner", "firstName lastName")
        .populate("tournament", "name");

      if (!match) {
        ResponseHelper.notFound(res, "Match");
        return;
      }

      ResponseHelper.success(res, match, "Match updated successfully");
    } catch (error) {
      console.error("Error updating match:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid match ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error updating match");
    }
  }) as RequestHandler,

  // Delete match
  deleteMatch: (async (req: Request, res: Response): Promise<void> => {
    try {
      const match = await Match.findByIdAndDelete(req.params.id);

      if (!match) {
        ResponseHelper.notFound(res, "Match");
        return;
      }

      ResponseHelper.success(res, null, "Match deleted successfully");
    } catch (error) {
      console.error("Error deleting match:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid match ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error deleting match");
    }
  }) as RequestHandler,

  // Record match result
  recordMatchResult: (async (req: Request, res: Response): Promise<void> => {
    try {
      const { sets, winner } = req.body;

      const validationErrors: ValidationError[] = [];

      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        validationErrors.push({
          field: "sets",
          message: "Sets data is required and must be an array",
        });
      }

      if (!winner) {
        validationErrors.push({
          field: "winner",
          message: "Winner is required",
        });
      }

      if (validationErrors.length > 0) {
        ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        return;
      }

      const match = await Match.findById(req.params.id);

      if (!match) {
        ResponseHelper.notFound(res, "Match");
        return;
      }

      // Update match with results
      match.sets = sets;
      match.winner = winner;
      match.status = MatchStatus.COMPLETED;
      match.completedDate = new Date();

      await match.save();

      const populatedMatch = await Match.findById(match._id)
        .populate("player1", "firstName lastName ranking")
        .populate("player2", "firstName lastName ranking")
        .populate("winner", "firstName lastName")
        .populate("tournament", "name");

      ResponseHelper.success(
        res,
        populatedMatch,
        "Match result recorded successfully",
      );
    } catch (error) {
      console.error("Error recording match result:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid match ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error recording match result");
    }
  }) as RequestHandler,
};
