import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/utils/App.error.js";
import { ZodError } from "zod/v3";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Errores personalizados
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      details: err.details,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Errores de validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Error de validación de datos",
      errorCode: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Errores genéricos
  return res.status(500).json({
    success: false,
    message: err.message,
    errorCode: "INTERNAL_ERROR",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
