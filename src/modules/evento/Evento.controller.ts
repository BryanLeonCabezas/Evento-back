import { Request, Response } from "express";
import { EventoService } from "./Evento.service.js";

export class EventoController {
  constructor(private eventoService: EventoService) {}

  getEventos = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const eventos = await this.eventoService.getEventos(page, limit);
    res.status(200).json(eventos);
  };
}
