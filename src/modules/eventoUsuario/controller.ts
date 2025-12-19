import { Request, Response } from "express";
import { EventoUsuarioService } from "./service.js";

export class EventoUsuariosController {
  constructor(private eventoUsuarioService: EventoUsuarioService) {}

  suscribirUsuario = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idUsuario = req.params.idUsuario;

    const suscripcion = await this.eventoUsuarioService.suscribirUsuario(
      idEvento,
      idUsuario
    );
    res.status(200).json(suscripcion);
  };

  eliminarSuscripcion = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idUsuario = req.params.idUsuario;

    const desuscripcion = await this.eventoUsuarioService.eliminarSuscripcion(
      idEvento,
      idUsuario
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
      await this.eventoUsuarioService.obtenerEventosSuscritosXUsuario(
        idUsuario
      );
    res.status(200).json(eventos);
  };
}
