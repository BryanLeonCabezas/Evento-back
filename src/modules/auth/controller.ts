import { Request, Response } from "express";
import { AuthService } from "./service.js";
import { log } from "console";
import { renderVerificationPage } from "../../common/utils/verification-page.util.js";

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

  loginUserPassword = async (req: Request, res: Response) => {
    const usuario = await this.authService.loginUserPassword(
      req.body.email,
      req.body.password,
    );
    res.status(200).json(usuario);
  };

  logout = async (req: Request, res: Response) => {
    log(req.params.idCliente);
    const usuario = await this.authService.logout(req.params.idCliente);
    res.status(200).json(usuario);
  };

  obtenerUsuarioAutenticado = async (req: Request, res: Response) => {
    const usuario = await this.authService.obtenerInfoUsuarioAutenticado(
      req.params.idCliente,
    );
    res.status(200).json(usuario);
  };

  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const data = await this.authService.refreshToken(refreshToken);
    res.status(200).json(data);
  };

  verifyAccount = async (req: Request, res: Response) => {
    const { token, idCliente } = req.query as {
      token: string;
      idCliente: string;
    };

    try {
      const result = await this.authService.verifyAccount(token, idCliente);

      if (result.status === "already_verified") {
        return res.send(
          renderVerificationPage("warning", "Ya verificado", result.message),
        );
      }

      return res.send(
        renderVerificationPage(
          "success",
          "¡Cuenta verificada!",
          result.message,
        ),
      );
    } catch (err: any) {
      const isExpired = err.statusCode === 410;
      return res
        .status(err.statusCode ?? 400)
        .send(
          renderVerificationPage(
            "error",
            isExpired ? "Enlace expirado" : "Enlace inválido",
            err.message,
          ),
        );
    }
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authService.resendVerificationEmail(email);
    res.status(200).json(result);
  };
}
