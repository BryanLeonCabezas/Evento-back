import { Request, Response } from "express";
import { EventoService } from "./service.js";
import { AppError } from "../../common/utils/App.error.js";

export class EventoController {
  constructor(private eventoService: EventoService) {}

  getEventos = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const eventos = await this.eventoService.getEventos(page, limit);

    if(!eventos || !eventos.data || eventos.data.length === 0)
      throw new AppError("No se encontraron eventos", 404);

    res.status(200).json(eventos);
  };
}
