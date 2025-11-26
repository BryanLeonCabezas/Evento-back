import { AppError } from "../common/utils/App.error.js";
import jwt from "jsonwebtoken";
export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError("Token no proporcionado", 401, "TOKEN_REQUIRED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Token inválido", 401, "INVALID_TOKEN"));
  }

  next();
};
