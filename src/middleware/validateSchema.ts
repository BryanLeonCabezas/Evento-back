// middlewares/validateSchema.ts
import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod/v3";
export const validateSchema = (schema: ZodSchema) => 
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // Solo parseamos el body directamente
        const parsed = schema.parse(req.body);
    
        (req as any).validated = parsed;
    
        next();
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            ok: false,
            message: "Error de validación en la solicitud.",
            errors: err.issues.map((issue) => {
              const section = "body"; // ahora siempre body
              const field = issue.path.join(".") || "(root)";
    
              return {
                location: section,
                field: field,
                path: `${section}.${field}`,
                message: issue.message,
                expected: (issue as any).expected ?? null,
                received: (issue as any).received ?? null,
              };
            }),
          });
        }
    
        next(err);
      }
    };
    