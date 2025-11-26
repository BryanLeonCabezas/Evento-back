import { Request, Response } from "express";
import { AuthService } from "./Auth.service.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  registerUserPassword = async (req: Request, res: Response) => {
    try {
      const usuario = await this.authService.registerUserPassword(req.body);
      res.status(201).json(usuario);
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  };

  // Handler para registro
  registerGoogle = async (req: Request, res: Response) => {
    const usuario = await this.authService.authGoogle(req.body);
    res.status(201).json(usuario);
  };
}
