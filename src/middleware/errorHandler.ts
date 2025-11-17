import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/utils/App.error.js";
import { ZodError } from "zod/v3";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {


  // Errores personalizados
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      details: err.details || null
    });
  }

  // Errores de validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      message: "Error de validación",
      errors: err.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  // Errores genéricos
  return res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
  });
};
