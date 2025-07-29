import { Request, Response, NextFunction } from "express";
import { ResponseHelper } from "../lib/utils/responseHandler";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", err);

  if (err instanceof Error) {
    if (err.name === "CastError") {
      ResponseHelper.badRequest(res, "Invalid ID format");
      return;
    }

    if (err.name === "ValidationError") {
      ResponseHelper.badRequest(res, "Validation failed");
      return;
    }

    if (err.name === "MongoError" && err.message.includes("duplicate key")) {
      ResponseHelper.badRequest(res, "Resource already exists");
      return;
    }
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
    });
    return;
  }

  ResponseHelper.internalError(res, "Internal server error");
};

export default errorHandler;
