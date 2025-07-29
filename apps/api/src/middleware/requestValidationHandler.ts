import {NextFunction, Request, RequestHandler, Response} from "express";
import {z, ZodSchema} from "zod";
import {ResponseHelper} from "../lib/utils/responseHandler";
import {ValidationError} from "@repo/lib";

interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) : RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: ValidationError[] = [];

        // Validate body if schema is provided
        if (schemas.body) {
            try {
                req.body = schemas.body.parse(req.body);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    validationErrors.push(...error.errors.map((err) => ({
                        field: `body.${err.path.join('.')}`,
                        message: err.message
                    })));
                }
            }
        }

        // Validate query if schema is provided
        if (schemas.query) {
            try {
                req.query = schemas.query.parse(req.query);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    validationErrors.push(...error.errors.map((err) => ({
                        field: `query.${err.path.join('.')}`,
                        message: err.message
                    })));
                }
            }
        }

        // Validate params if schema is provided
        if (schemas.params) {
            try {
                const validated = schemas.params.parse(req.params);
                req.params = validated;
            } catch (error) {
                if (error instanceof z.ZodError) {
                    validationErrors.push(...error.errors.map((err) => ({
                        field: `params.${err.path.join('.')}`,
                        message: err.message
                    })));
                }
            }
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return ResponseHelper.badRequest(res, "Validation failed", validationErrors);
        }

        next();
    };
};

// Convenience functions for single validations (optional)
export const validateBody = (schema: ZodSchema) : RequestHandler => validate({ body: schema });
export const validateQuery = (schema: ZodSchema): RequestHandler => validate({ query: schema });
export const validateParams = (schema: ZodSchema) : RequestHandler=> validate({ params: schema });