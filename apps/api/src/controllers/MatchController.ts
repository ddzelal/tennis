import { Request, Response, RequestHandler } from "express";
import { Match, Tournament, Player } from "../models";
import { ResponseHelper, PaginationHelper } from "../lib/utils/responseHandler";
import { asyncHandler } from "../lib/utils/asyncHandler";
import {
    CreateMatchData,
    UpdateMatchData,
    RecordMatchResultData,
    MatchQueryParams,
    MongoIdParams,
    MatchStatus
} from "@repo/lib";

export class MatchController {

    static getAllMatches: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const {
            tournamentId,
            stageId,
            playerId,
            status,
            round,
            dateFrom,
            dateTo,
            search,
            page,
            limit
        } = req.query as unknown as MatchQueryParams;

        const filter: any = {};

        if (tournamentId) filter.tournament = tournamentId;
        if (stageId) filter.stage = stageId;
        if (status) filter.status = status;
        if (round) filter.round = round;

        if (playerId) {
            filter.$or = [{ player1: playerId }, { player2: playerId }];
        }

        // Date range filtering
        if (dateFrom || dateTo) {
            filter.scheduledDate = {};
            if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom);
            if (dateTo) filter.scheduledDate.$lte = new Date(dateTo);
        }

        const total = await Match.countDocuments(filter);
        const skip = PaginationHelper.getSkipValue(page, limit);

        const matches = await Match.find(filter)
            .sort({ scheduledDate: -1 })
            .populate("player1", "firstName lastName ranking")
            .populate("player2", "firstName lastName ranking")
            .populate("winner", "firstName lastName")
            .populate("tournament", "name")
            .populate("stage", "name type")
            .skip(skip)
            .limit(limit);

        const pagination = PaginationHelper.calculatePagination(page, limit, total);

        return ResponseHelper.paginatedSuccess(
            res,
            matches,
            pagination,
            `Found ${total} match(es)`
        );
    });

    static getMatchById: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const { id } = req.params as MongoIdParams;

        const match = await Match.findById(id)
            .populate("player1", "firstName lastName ranking")
            .populate("player2", "firstName lastName ranking")
            .populate("winner", "firstName lastName")
            .populate("tournament", "name")
            .populate("stage", "name type");

        if (!match) {
            return ResponseHelper.notFound(res, "Match");
        }

        return ResponseHelper.success(res, match, "Match retrieved successfully");
    });

    static createMatch: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const {
            tournament,
            stage,
            player1,
            player2,
            scheduledDate,
            status,
            notes
        } = req.body as CreateMatchData;

        // Validate tournament exists
        const tournamentExists = await Tournament.exists({ _id: tournament });
        if (!tournamentExists) {
            return ResponseHelper.badRequest(res, "Tournament not found");
        }

        // Validate players exist
        const [player1Exists, player2Exists] = await Promise.all([
            Player.exists({ _id: player1 }),
            Player.exists({ _id: player2 })
        ]);

        if (!player1Exists || !player2Exists) {
            return ResponseHelper.badRequest(res, "One or both players not found");
        }

        const match = new Match({
            tournament,
            stage,
            player1,
            player2,
            scheduledDate: new Date(scheduledDate),
            status: status || "SCHEDULED",
            notes,
            sets: []
        });

        await match.save();

        // Populate after save
        const populatedMatch = await Match.findById(match._id)
            .populate("player1", "firstName lastName ranking")
            .populate("player2", "firstName lastName ranking")
            .populate("tournament", "name")
            .populate("stage", "name type");

        return ResponseHelper.created(res, populatedMatch, "Match created successfully");
    });

    static updateMatch: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const { id } = req.params as MongoIdParams;
        const updateData = req.body as UpdateMatchData;

        // Build update object
        const finalUpdateData: any = { ...updateData };

        if (updateData.scheduledDate) {
            finalUpdateData.scheduledDate = new Date(updateData.scheduledDate);
        }

        if (updateData.completedDate) {
            finalUpdateData.completedDate = new Date(updateData.completedDate);
        }

        const match = await Match.findByIdAndUpdate(id, finalUpdateData, {
            new: true,
            runValidators: true
        })
            .populate("player1", "firstName lastName ranking")
            .populate("player2", "firstName lastName ranking")
            .populate("winner", "firstName lastName")
            .populate("tournament", "name")
            .populate("stage", "name type");

        if (!match) {
            return ResponseHelper.notFound(res, "Match");
        }

        return ResponseHelper.success(res, match, "Match updated successfully");
    });

    static deleteMatch: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const { id } = req.params as MongoIdParams;

        const match = await Match.findByIdAndDelete(id);

        if (!match) {
            return ResponseHelper.notFound(res, "Match");
        }

        return ResponseHelper.success(res, null, "Match deleted successfully");
    });

    static recordMatchResult: RequestHandler = asyncHandler(async (
        req: Request,
        res: Response
    ) => {
        const { id } = req.params as MongoIdParams;
        const { sets, winner } = req.body as RecordMatchResultData;

        const match = await Match.findById(id);

        if (!match) {
            return ResponseHelper.notFound(res, "Match");
        }

        // Validate winner is one of the players
        if (winner !== match.player1.toString() && winner !== match.player2.toString()) {
            return ResponseHelper.badRequest(res, "Winner must be one of the match players");
        }

        // Update match with results
        match.sets = sets;
        match.winner = winner;
        match.status = "COMPLETED" as MatchStatus;
        match.completedDate = new Date();

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate("player1", "firstName lastName ranking")
            .populate("player2", "firstName lastName ranking")
            .populate("winner", "firstName lastName")
            .populate("tournament", "name")
            .populate("stage", "name type");

        return ResponseHelper.success(
            res,
            populatedMatch,
            "Match result recorded successfully"
        );
    });
}