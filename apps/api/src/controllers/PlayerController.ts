import { Request, Response, RequestHandler } from "express";
import { Player } from "../models";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { ValidationError } from "@repo/lib";
import {
  CreatePlayerData,
  UpdatePlayerData,
  GetAllPlayersResponse,
  GetPlayerByIdResponse,
  CreatePlayerResponse,
  UpdatePlayerResponse,
  DeletePlayerResponse,
} from "@repo/lib";

export const PlayerController = {
  // Get all players with optional search and pagination
  getAllPlayers: (async (
    req: Request,
    res: Response<GetAllPlayersResponse>,
  ) => {
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
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
          ],
        };
      }

      // Count total documents
      const total = await Player.countDocuments(query);

      // Get paginated results
      const skip = PaginationHelper.getSkipValue(page, limit);
      const players = await Player.find(query)
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(limit);

      // Calculate pagination data
      const pagination = PaginationHelper.calculatePagination(
        page,
        limit,
        total,
      );

      // Return paginated response
      return ResponseHelper.paginatedSuccess(
        res,
        players,
        pagination,
        `Found ${total} player(s)`,
      );
    } catch (error) {
      console.error("Error getting players:", error);
      return ResponseHelper.internalError(res, "Error getting players");
    }
  }) as RequestHandler,

  // Get player by ID
  getPlayerById: (async (
    req: Request,
    res: Response<GetPlayerByIdResponse>,
  ) => {
    try {
      const player = await Player.findById(req.params.id);

      if (!player) {
        return ResponseHelper.notFound(res, "Player");
      }

      return ResponseHelper.success(
        res,
        player,
        "Player retrieved successfully",
      );
    } catch (error) {
      console.error("Error getting player:", error);

      // Handle invalid ObjectId
      if (error instanceof Error && error.name === "CastError") {
        return ResponseHelper.badRequest(res, "Invalid player ID format");
      }

      return ResponseHelper.internalError(res, "Error getting player");
    }
  }) as RequestHandler,

  // Create a new player
  createPlayer: (async (req: Request, res: Response<CreatePlayerResponse>) => {
    try {
      const { firstName, lastName, dateOfBirth, ranking }: CreatePlayerData =
        req.body;

      // Validation
      const validationErrors: ValidationError[] = [];

      if (!firstName || firstName.trim() === "") {
        validationErrors.push({
          field: "firstName",
          message: "First name is required",
        });
      }

      if (!lastName || lastName.trim() === "") {
        validationErrors.push({
          field: "lastName",
          message: "Last name is required",
        });
      }

      if (!dateOfBirth) {
        validationErrors.push({
          field: "dateOfBirth",
          message: "Date of birth is required",
        });
      } else {
        // Validate date format and that it's in the past
        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate.getTime())) {
          validationErrors.push({
            field: "dateOfBirth",
            message: "Invalid date format",
          });
        } else if (birthDate >= new Date()) {
          validationErrors.push({
            field: "dateOfBirth",
            message: "Date of birth must be in the past",
          });
        }
      }

      if (
        ranking !== undefined &&
        (isNaN(ranking) || ranking < 1 || ranking > 10000)
      ) {
        validationErrors.push({
          field: "ranking",
          message: "Ranking must be between 1 and 10000",
        });
      }

      if (validationErrors.length > 0) {
        return ResponseHelper.badRequest(
          res,
          "Validation failed",
          validationErrors,
        );
      }

      // Create new player
      const player = new Player({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        ranking: ranking || null,
      });

      await player.save();

      return ResponseHelper.created(res, player, "Player created successfully");
    } catch (error) {
      console.error("Error creating player:", error);

      // Handle mongoose validation errors
      if (error instanceof Error && error.name === "ValidationError") {
        return ResponseHelper.badRequest(res, "Validation failed");
      }

      return ResponseHelper.internalError(res, "Error creating player");
    }
  }) as RequestHandler,

  // Update player
  updatePlayer: (async (req: Request, res: Response<UpdatePlayerResponse>) => {
    try {
      const { firstName, lastName, dateOfBirth, ranking }: UpdatePlayerData =
        req.body;

      // Validation
      const validationErrors: ValidationError[] = [];

      if (firstName !== undefined && (!firstName || firstName.trim() === "")) {
        validationErrors.push({
          field: "firstName",
          message: "First name cannot be empty",
        });
      }

      if (lastName !== undefined && (!lastName || lastName.trim() === "")) {
        validationErrors.push({
          field: "lastName",
          message: "Last name cannot be empty",
        });
      }

      if (dateOfBirth !== undefined) {
        if (!dateOfBirth) {
          validationErrors.push({
            field: "dateOfBirth",
            message: "Date of birth cannot be empty",
          });
        } else {
          const birthDate = new Date(dateOfBirth);
          if (isNaN(birthDate.getTime())) {
            validationErrors.push({
              field: "dateOfBirth",
              message: "Invalid date format",
            });
          } else if (birthDate >= new Date()) {
            validationErrors.push({
              field: "dateOfBirth",
              message: "Date of birth must be in the past",
            });
          }
        }
      }

      if (
        ranking !== undefined &&
        (isNaN(ranking) || ranking < 1 || ranking > 10000)
      ) {
        validationErrors.push({
          field: "ranking",
          message: "Ranking must be between 1 and 10000",
        });
      }

      if (validationErrors.length > 0) {
        return ResponseHelper.badRequest(
          res,
          "Validation failed",
          validationErrors,
        );
      }

      // Build update data
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (dateOfBirth !== undefined)
        updateData.dateOfBirth = new Date(dateOfBirth);
      if (ranking !== undefined) updateData.ranking = ranking;

      // Update player
      const player = await Player.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!player) {
        return ResponseHelper.notFound(res, "Player");
      }

      return ResponseHelper.success(res, player, "Player updated successfully");
    } catch (error) {
      console.error("Error updating player:", error);

      if (error instanceof Error && error.name === "CastError") {
        return ResponseHelper.badRequest(res, "Invalid player ID format");
      }

      if (error instanceof Error && error.name === "ValidationError") {
        return ResponseHelper.badRequest(res, "Validation failed");
      }

      return ResponseHelper.internalError(res, "Error updating player");
    }
  }) as RequestHandler,

  // Delete player
  deletePlayer: (async (req: Request, res: Response<DeletePlayerResponse>) => {
    try {
      const player = await Player.findByIdAndDelete(req.params.id);

      if (!player) {
        return ResponseHelper.notFound(res, "Player");
      }

      return ResponseHelper.success(res, null, "Player deleted successfully");
    } catch (error) {
      console.error("Error deleting player:", error);

      if (error instanceof Error && error.name === "CastError") {
        return ResponseHelper.badRequest(res, "Invalid player ID format");
      }

      return ResponseHelper.internalError(res, "Error deleting player");
    }
  }) as RequestHandler,
};
