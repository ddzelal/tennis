import { Response } from 'express';
import { StandardResponse, PaginatedResponse, PaginationData, ErrorResponse, ValidationError } from '../../types/response';

export class ResponseHelper {
  
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    const response: StandardResponse<T> = {
      success: true,
      data,
      message: message || 'Operation successful',
      timestamp: new Date().toISOString()
    };
    
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message || 'Resource created successfully', 201);
  }

  static paginatedSuccess<T>(
    res: Response, 
    data: T[], 
    pagination: PaginationData, 
    message?: string
  ): void {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination,
      message: message || 'Data retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(response);
  }

  // Error responses
  static error(
    res: Response, 
    error: string, 
    statusCode: number = 500, 
    validationErrors?: ValidationError[]
  ): void {
    const response: ErrorResponse = {
      success: false,
      error,
      validationErrors,
      timestamp: new Date().toISOString()
    };
    
    res.status(statusCode).json(response);
  }

  static badRequest(res: Response, error: string = 'Bad request', validationErrors?: ValidationError[]): void {
    this.error(res, error, 400, validationErrors);
  }

  static notFound(res: Response, resource: string = 'Resource'): void {
    this.error(res, `${resource} not found`, 404);
  }

  static unauthorized(res: Response, error: string = 'Unauthorized'): void {
    this.error(res, error, 401);
  }

  static forbidden(res: Response, error: string = 'Forbidden'): void {
    this.error(res, error, 403);
  }

  static conflict(res: Response, error: string = 'Resource already exists'): void {
    this.error(res, error, 409);
  }

  static internalError(res: Response, error: string = 'Internal server error'): void {
    this.error(res, error, 500);
  }
}

export class PaginationHelper {
  static calculatePagination(page: number, limit: number, total: number): PaginationData {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  static getSkipValue(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}