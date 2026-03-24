import { AppError } from "../common/utils/App.error.js";
import jwt from "jsonwebtoken";
export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader); // Debug: Verificar el contenido del header de autorización
  if (!authHeader) {
    return next(new AppError("Error en la autenticación, token no proporcionado", 401, "TOKEN_REQUIRED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Token verificado:", decoded);
    (req as any).user = decoded;
    next();
  } catch (err:any) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expirado", 401));
    }
    return next(new AppError("Token inválido", 401));
  }

};
