
import { Request, Response, RequestHandler } from "express";
import { Player } from "../models";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { asyncHandler } from "../lib/utils/asyncHandler";
import {
  CreatePlayerData,
  UpdatePlayerData,
  GetAllPlayersResponse,
  GetPlayerByIdResponse,
  CreatePlayerResponse,
  UpdatePlayerResponse,
  DeletePlayerResponse,
  PaginationQuery,
  MongoIdParams,
} from "@repo/lib";

export class PlayerController {

  static getAllPlayers: RequestHandler = asyncHandler(async (
      req: Request,
      res: Response<GetAllPlayersResponse>,
  ) => {
    const { search, page, limit } = req.query as unknown as PaginationQuery;

    let query: any = {};
    if (search && search.trim()) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const total = await Player.countDocuments(query);
    const skip = PaginationHelper.getSkipValue(page, limit);
    const players = await Player.find(query)
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(limit);

    const pagination = PaginationHelper.calculatePagination(page, limit, total);

    return ResponseHelper.paginatedSuccess(
        res,
        players,
        pagination,
        `Found ${total} player(s)`,
    );
  });

  static getPlayerById: RequestHandler = asyncHandler(async (
      req: Request,
      res: Response<GetPlayerByIdResponse>,
  ) => {
    const { id } = req.params as MongoIdParams;

    const player = await Player.findById(id);

    if (!player) {
      return ResponseHelper.notFound(res, "Player");
    }

    return ResponseHelper.success(
        res,
        player,
        "Player retrieved successfully",
    );
  });

  static createPlayer: RequestHandler = asyncHandler(async (
      req: Request,
      res: Response<CreatePlayerResponse>
  ) => {
    const { firstName, lastName, dateOfBirth, ranking } = req.body as CreatePlayerData;

    const player = new Player({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      ranking: ranking || null,
    });

    await player.save();

    return ResponseHelper.created(res, player, "Player created successfully");
  });

  static updatePlayer: RequestHandler = asyncHandler(async (
      req: Request,
      res: Response<UpdatePlayerResponse>
  ) => {
    const { id } = req.params as MongoIdParams;
    const updateData = req.body as UpdatePlayerData;

    const finalUpdateData: any = { ...updateData };
    if (updateData.dateOfBirth) {
      finalUpdateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const player = await Player.findByIdAndUpdate(id, finalUpdateData, {
      new: true,
      runValidators: true,
    });

    if (!player) {
      return ResponseHelper.notFound(res, "Player");
    }

    return ResponseHelper.success(res, player, "Player updated successfully");
  });

  static deletePlayer: RequestHandler = asyncHandler(async (
      req: Request,
      res: Response<DeletePlayerResponse>
  ) => {
    const { id } = req.params as MongoIdParams;

    const player = await Player.findByIdAndDelete(id);

    if (!player) {
      return ResponseHelper.notFound(res, "Player");
    }

    return ResponseHelper.success(res, null, "Player deleted successfully");
  });
}