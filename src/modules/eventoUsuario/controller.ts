import { NextFunction, Request, Response } from "express";
import { EventoUsuarioService } from "./service.js";
import { EventosUsuarios } from "./entity.js";

export class EventoUsuariosController {
  constructor(private eventoUsuarioService: EventoUsuarioService) {}

  suscribirUsuario = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idUsuario = req.params.idUsuario;
    const { observacion, idTarjeta } = req.body;
    const suscripcion = await this.eventoUsuarioService.suscribirUsuario(
      idEvento,
      idUsuario,
      undefined,
      observacion,
      idTarjeta,
    );
    res.status(200).json(suscripcion);
  };

  eliminarSuscripcion = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idUsuario = req.params.idUsuario;

    const desuscripcion = await this.eventoUsuarioService.eliminarSuscripcion(
      idEvento,
      idUsuario,
    );
    res.status(200).json(desuscripcion);
  };

  obtenerUsuariosSuscritosXEvento = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const usuarios =
      await this.eventoUsuarioService.obtenerUsuariosSuscritosXEvento(idEvento);
    res.status(200).json(usuarios);
  };

  obtenerEventosXUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario;
    const eventos =
      await this.eventoUsuarioService.obtenerEventosUsuario(idUsuario);
    res.status(200).json(eventos);
  };

  initCheckout = async (req: Request, res: Response, next: NextFunction) => {
    console.log("initCheckout controller");
    console.log(req.body)
    try {
      const { idEvento } = req.params;
      const { idUsuario } = req.body;
      const result = await this.eventoUsuarioService.initCheckout(
        Number(idEvento),
        idUsuario,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  confirmarCheckout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { idEvento } = req.params;
      const { idUsuario, transactionId, checkoutResponse } = req.body;
      const result = await this.eventoUsuarioService.confirmarCheckout(
        Number(idEvento),
        idUsuario,
        transactionId,
        checkoutResponse,
      );

      // mismo bloque de correo que suscribirUsuario
      //sendCompraEmail({ ...result.extra }).catch(() => {});

      res.json({
        message: result.message,
        data: result.data,
        success: result.success,
      });
    } catch (e) {
      next(e);
    }
  };
}
