import { Request, Response, RequestHandler } from "express";
import { Tournament, Stage, Match } from "../models";
import mongoose from "mongoose";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { asyncHandler } from "../lib/utils/asyncHandler";
import { ValidationError } from "@repo/lib";
import { GetPlayersByTournamentId } from "@repo/lib";

export const TournamentController: Record<string, RequestHandler> = {
  // Get all tournaments
  getAllTournaments: asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      let query: any = {};
      if (search && search.trim()) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        };
      }

      const total = await Tournament.countDocuments(query);
      const skip = PaginationHelper.getSkipValue(page, limit);

      const tournaments = await Tournament.find(query)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .skip(skip)
        .limit(limit);

      const pagination = PaginationHelper.calculatePagination(
        page,
        limit,
        total,
      );

      ResponseHelper.paginatedSuccess(
        res,
        tournaments,
        pagination,
        `Found ${total} tournament(s)`,
      );
  }),

  // Get Player Tournaments
  getPlayersInTournament: asyncHandler(async (
    req: Request,
    res: Response<GetPlayersByTournamentId>,
  ): Promise<void> => {
      const tournamentId = req.params.id;

      if (!tournamentId) {
        return ResponseHelper.badRequest(res, "Tournament ID is required");
      }

      // Pronađi tournament i populate players
      const tournament =
        await Tournament.findById(tournamentId).populate("players");

      if (!tournament) {
        return ResponseHelper.notFound(res, "Tournament not found");
      }

      const players = tournament.players || [];

      console.log(players, "from backend");

      return ResponseHelper.success(
        res,
        players,
        `Found ${players.length} player(s) in tournament`,
      );
  }),

  // Get tournament by ID
  getTournamentById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const tournament = await Tournament.findById(req.params.id)
        .populate("players", "firstName lastName ranking")
        .populate("createdBy", "name email");

      if (!tournament) {
        ResponseHelper.notFound(res, "Tournament");
        return;
      }

      ResponseHelper.success(
        res,
        tournament,
        "Tournament retrieved successfully",
      );
  }),

  // Create a new tournament
  createTournament: asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const {
        name,
        description,
        type,
        startDate,
        endDate,
        players,
        maxPlayers,
        rules,
      } = req.body;

      const validationErrors: ValidationError[] = [];

      if (!name || name.trim() === "") {
        validationErrors.push({ field: "name", message: "Name is required" });
      }

      if (!type) {
        validationErrors.push({ field: "type", message: "Type is required" });
      }

      if (maxPlayers && (isNaN(maxPlayers) || maxPlayers < 1)) {
        validationErrors.push({
          field: "maxPlayers",
          message: "Max players must be a positive number",
        });
      }

      if (validationErrors.length > 0) {
        ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        return;
      }

      const createdBy = req.body.createdBy || "000000000000000000000000";

      const tournament = new Tournament({
        name: name.trim(),
        description: description?.trim(),
        type,
        startDate,
        endDate,
        players: players || [],
        maxPlayers,
        rules,
        createdBy,
        status: "DRAFT",
      });

      await tournament.save();

      ResponseHelper.created(
        res,
        tournament,
        "Tournament created successfully",
      );
  }),

  // Update tournament
  updateTournament: asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const {
        name,
        description,
        type,
        status,
        startDate,
        endDate,
        players,
        maxPlayers,
        rules,
      } = req.body;

      const validationErrors: ValidationError[] = [];

      if (name !== undefined && (!name || name.trim() === "")) {
        validationErrors.push({
          field: "name",
          message: "Name cannot be empty",
        });
      }

      if (maxPlayers !== undefined && (isNaN(maxPlayers) || maxPlayers < 1)) {
        validationErrors.push({
          field: "maxPlayers",
          message: "Max players must be a positive number",
        });
      }

      if (validationErrors.length > 0) {
        ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined)
        updateData.description = description?.trim();
      if (type !== undefined) updateData.type = type;
      if (status !== undefined) updateData.status = status;
      if (startDate !== undefined) updateData.startDate = startDate;
      if (endDate !== undefined) updateData.endDate = endDate;
      if (players !== undefined) updateData.players = players;
      if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers;
      if (rules !== undefined) updateData.rules = rules;

      const tournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!tournament) {
        ResponseHelper.notFound(res, "Tournament");
        return;
      }

      ResponseHelper.success(
        res,
        tournament,
        "Tournament updated successfully",
      );
  }),

  // Delete tournament
  deleteTournament: asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const tournament = await Tournament.findByIdAndDelete(req.params.id);

      if (!tournament) {
        ResponseHelper.notFound(res, "Tournament");
        return;
      }

      // Delete related data
      await Stage.deleteMany({ tournament: req.params.id });
      await Match.deleteMany({ tournament: req.params.id });

      ResponseHelper.success(
        res,
        null,
        "Tournament and related data deleted successfully",
      );
  }),

  // Add player to tournament
  addPlayerToTournament: asyncHandler(async (
    req: Request,
    res: Response,
  ): Promise<void> => {
      const { playerId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        ResponseHelper.badRequest(res, "Invalid player ID format");
        return;
      }

      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        ResponseHelper.notFound(res, "Tournament");
        return;
      }

      if (
        tournament.maxPlayers &&
        tournament.players.length >= tournament.maxPlayers
      ) {
        ResponseHelper.badRequest(res, "Tournament is full");
        return;
      }

      const updatedTournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { players: playerId } },
        { new: true, runValidators: true },
      );

      ResponseHelper.success(
        res,
        updatedTournament,
        "Player added to tournament successfully",
      );
  }),

  // Remove player from tournament
  removePlayerFromTournament: asyncHandler(async (
    req: Request,
    res: Response,
  ): Promise<void> => {
      const { playerId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        ResponseHelper.badRequest(res, "Invalid player ID format");
        return;
      }

      const tournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        { $pull: { players: playerId } },
        { new: true, runValidators: true },
      );

      if (!tournament) {
        ResponseHelper.notFound(res, "Tournament");
        return;
      }

      ResponseHelper.success(
        res,
        tournament,
        "Player removed from tournament successfully",
      );
  }),
};
