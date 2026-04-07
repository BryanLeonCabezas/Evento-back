// middlewares/validateSchema.ts
import e, { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod/v3";
import { AppError } from "../common/utils/App.error.js";
export const validateSchema =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Solo parseamos el body directamente
      const parsed = schema.parse(req.body);

      (req as any).validated = parsed;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        if (err instanceof ZodError) {
          const details = err.issues.map((issue) => ({
            field: issue.path.join(".") || "(root)",
            message: issue.message,
          }));

          return next(
            new AppError(
              "Error de validación del esquema",
              400,
              "VALIDATION_ERROR",
              details
            )
          );
        }

        next(err);
      }
    }
  };

export const validateParamsSchema =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
     
      req.params = schema.parse(req.params);
     
      

      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        if (err instanceof ZodError) {
          const details = err.issues.map((issue) => ({
            field: issue.path.join(".") || "(root)",
            message: issue.message,
          }));

          return next(
            new AppError(
              "Error de validación del esquema",
              400,
              "VALIDATION_ERROR",
              details
            )
          );
        }

        next(err);
      }
    }
  };
