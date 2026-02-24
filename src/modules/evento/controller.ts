import { Request, Response } from "express";
import { EventoService } from "./service.js";
import { AppError } from "../../common/utils/App.error.js";

export class EventoController {
  constructor(private eventoService: EventoService) {}

  getEventos = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const idCliente = req.params.idCliente as string;
    const eventos = await this.eventoService.getEventosByUsuario(
      page,
      limit,
      idCliente,
    );

    if (!eventos || !eventos.data || eventos.data.length === 0)
      throw new AppError("No se encontraron eventos", 404);

    res.status(200).json(eventos);
  };

  getEventoById = async (req: Request, res: Response) => {
    console.log("req.params", req.params);
    const idEvento = Number(req.params.id);
    console.log("idEvento", idEvento);

    const evento = await this.eventoService.getEventoById(idEvento);
    res.status(200).json(evento);
  };

  getHomeEventos = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente as string;

    const eventos = await this.eventoService.getHomeEventos(idCliente);

    if (!eventos) throw new AppError("No se encontraron eventos", 404);

    res.status(200).json(eventos);
  };
}
