import { Request, Response, RequestHandler } from "express";
import { Stage, Tournament, Match } from "../models";
import mongoose from "mongoose";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { ValidationError } from "@repo/lib";

export const StageController = {
  // Get all stages
  getAllStages: (async (req: Request, res: Response): Promise<void> => {
    try {
      const { tournamentId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filter: any = {};
      if (tournamentId) filter.tournament = tournamentId;

      const total = await Stage.countDocuments(filter);
      const skip = PaginationHelper.getSkipValue(page, limit);

      const stages = await Stage.find(filter)
        .sort({ order: 1 })
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
        stages,
        pagination,
        `Found ${total} stage(s)`,
      );
    } catch (error) {
      console.error("Error getting stages:", error);
      ResponseHelper.internalError(res, "Error getting stages");
    }
  }) as RequestHandler,

  // Get stage by ID
  getStageById: (async (req: Request, res: Response): Promise<void> => {
    try {
      const stage = await Stage.findById(req.params.id)
        .populate("tournament", "name")
        .populate("players", "name firstName lastName ranking dateOfBirth");

      if (!stage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      ResponseHelper.success(res, stage, "Stage retrieved successfully");
    } catch (error) {
      console.error("Error getting stage:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid stage ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error getting stage");
    }
  }) as RequestHandler,

  // Create a new stage
  createStage: (async (req: Request, res: Response): Promise<void> => {
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
        rules,
      } = req.body;

      const validationErrors: ValidationError[] = [];

      if (!tournament) {
        validationErrors.push({
          field: "tournament",
          message: "Tournament is required",
        });
      }

      if (!name || name.trim() === "") {
        validationErrors.push({ field: "name", message: "Name is required" });
      }

      if (!type) {
        validationErrors.push({ field: "type", message: "Type is required" });
      }

      if (order === undefined || order === null || isNaN(order)) {
        validationErrors.push({
          field: "order",
          message: "Order is required and must be a number",
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

      // Check if stage with same order exists
      const existingStage = await Stage.findOne({ tournament, order });

      if (existingStage) {
        ResponseHelper.conflict(
          res,
          `A stage with order ${order} already exists for this tournament`,
        );
        return;
      }

      const stage = new Stage({
        tournament,
        name: name.trim(),
        type,
        order,
        startDate,
        endDate,
        players: players || [],
        advancingPlayers,
        rules,
      });

      await stage.save();
      await Tournament.findByIdAndUpdate(
        tournament,
        {
          $addToSet: { stages: stage._id },
        },
        { new: true },
      );

      ResponseHelper.created(res, stage, "Stage created successfully");
    } catch (error) {
      console.error("Error creating stage:", error);
      ResponseHelper.internalError(res, "Error creating stage");
    }
  }) as RequestHandler,

  // Update stage
  updateStage: (async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        type,
        order,
        startDate,
        endDate,
        players,
        advancingPlayers,
        rules,
      } = req.body;

      const validationErrors: ValidationError[] = [];

      if (name !== undefined && (!name || name.trim() === "")) {
        validationErrors.push({
          field: "name",
          message: "Name cannot be empty",
        });
      }

      if (order !== undefined && (order === null || isNaN(order))) {
        validationErrors.push({
          field: "order",
          message: "Order must be a number",
        });
      }

      if (validationErrors.length > 0) {
        ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        return;
      }

      // Check if order is being changed and conflicts
      if (order !== undefined) {
        const stage = await Stage.findById(req.params.id);
        if (!stage) {
          ResponseHelper.notFound(res, "Stage");
          return;
        }

        if (stage.order !== order) {
          const existingStage = await Stage.findOne({
            tournament: stage.tournament,
            order,
            _id: { $ne: req.params.id },
          });

          if (existingStage) {
            ResponseHelper.conflict(
              res,
              `A stage with order ${order} already exists for this tournament`,
            );
            return;
          }
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (type !== undefined) updateData.type = type;
      if (order !== undefined) updateData.order = order;
      if (startDate !== undefined) updateData.startDate = startDate;
      if (endDate !== undefined) updateData.endDate = endDate;
      if (players !== undefined) updateData.players = players;
      if (advancingPlayers !== undefined)
        updateData.advancingPlayers = advancingPlayers;
      if (rules !== undefined) updateData.rules = rules;

      const updatedStage = await Stage.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!updatedStage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      ResponseHelper.success(res, updatedStage, "Stage updated successfully");
    } catch (error) {
      console.error("Error updating stage:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid stage ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error updating stage");
    }
  }) as RequestHandler,

  // Delete stage
  deleteStage: (async (req: Request, res: Response): Promise<void> => {
    try {
      const stage = await Stage.findByIdAndDelete(req.params.id);

      if (!stage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      // Delete all matches associated with the stage
      await Match.deleteMany({ stage: req.params.id });
      // Remove stage reference from tournament
      await Tournament.findByIdAndUpdate(
        stage.tournament,
        {
          $pull: { stages: stage._id },
        },
        { new: true },
      );

      ResponseHelper.success(
        res,
        null,
        "Stage and related matches deleted successfully",
      );
    } catch (error) {
      console.error("Error deleting stage:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid stage ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error deleting stage");
    }
  }) as RequestHandler,

  // Add player to stage
  addPlayerToStage: (async (req: Request, res: Response): Promise<void> => {
    try {
      const { playerId } = req.body;

      if (!playerId) {
        ResponseHelper.badRequest(res, "Player ID is required");
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        ResponseHelper.badRequest(res, "Invalid player ID format");
        return;
      }

      const stage = await Stage.findById(req.params.id);

      if (!stage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      // Check if player is already in the stage
      if (stage.players.includes(playerId)) {
        ResponseHelper.badRequest(res, "Player is already in this stage");
        return;
      }

      stage.players.push(playerId);
      await stage.save();

      ResponseHelper.success(res, stage, "Player added to stage successfully");
    } catch (error) {
      console.error("Error adding player to stage:", error);
      ResponseHelper.internalError(res, "Error adding player to stage");
    }
  }) as RequestHandler,

  // Remove player from the stage
  removePlayerFromStage: (async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { playerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(playerId as string)) {
        ResponseHelper.badRequest(res, "Invalid player ID format");
        return;
      }

      const stage = await Stage.findById(req.params.id);

      if (!stage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      // Check if the player is in the stage
      if (!stage.players.includes(playerId)) {
        ResponseHelper.badRequest(res, "Player is not in this stage");
        return;
      }

      // Remove player from stage
      stage.players = stage.players.filter((p) => p.toString() !== playerId);
      await stage.save();

      ResponseHelper.success(
        res,
        stage,
        "Player removed from stage successfully",
      );
    } catch (error) {
      console.error("Error removing player from stage:", error);
      ResponseHelper.internalError(res, "Error removing player from stage");
    }
  }) as RequestHandler,

  // Generate matches for a stage
  generateMatches: (async (req: Request, res: Response): Promise<void> => {
    try {
      const stage = await Stage.findById(req.params.id).populate("tournament");

      if (!stage) {
        ResponseHelper.notFound(res, "Stage");
        return;
      }

      // Check if stage has enough players
      if (!stage.players || stage.players.length < 2) {
        ResponseHelper.badRequest(
          res,
          "Stage must have at least 2 players to generate matches",
        );
        return;
      }

      // Generate matches based on stage type
      const matches = [];

      if (stage.type === "GROUP" || stage.type === "ROUND_ROBIN") {
        // Round-robin: each player plays against every other player
        for (let i = 0; i < stage.players.length; i++) {
          for (let j = i + 1; j < stage.players.length; j++) {
            matches.push({
              tournament: stage.tournament._id,
              stage: stage._id,
              player1: stage.players[i],
              player2: stage.players[j],
              status: "SCHEDULED",
            });
          }
        }
      } else if (
        stage.type === "KNOCKOUT" ||
        stage.type === "SEMIFINALS" ||
        stage.type === "FINALS"
      ) {
        // Knockout: pair players sequentially
        for (let i = 0; i < stage.players.length; i += 2) {
          if (i + 1 < stage.players.length) {
            matches.push({
              tournament: stage.tournament._id,
              stage: stage._id,
              player1: stage.players[i],
              player2: stage.players[i + 1],
              status: "SCHEDULED",
            });
          }
        }
      }

      // Create all matches
      if (matches.length > 0) {
        await Match.insertMany(matches);
      }

      ResponseHelper.success(
        res,
        { matchCount: matches.length },
        `${matches.length} matches generated successfully`,
      );
    } catch (error) {
      console.error("Error generating matches:", error);

      if (error instanceof Error && error.name === "CastError") {
        ResponseHelper.badRequest(res, "Invalid stage ID format");
        return;
      }

      ResponseHelper.internalError(res, "Error generating matches");
    }
  }) as RequestHandler,
};
