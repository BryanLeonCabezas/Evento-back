import { Request, Response } from "express";
import { SalonesService } from "./service.js";

export class SalonesController {
  constructor(private salonesService: SalonesService) {}

  obtenerSalonesXLocal = async (req: Request, res: Response) => {
    const idLocal = Number(req.params.idLocal);
    const salones = await this.salonesService.obtenerSalonesXLocal(idLocal);
    res.status(200).json(salones);
  };

  obtenerSalonById = async (req: Request, res: Response) => {
    const idSalon = Number(req.params.idSalon);
    const salon = await this.salonesService.obtenerSalonById(idSalon);
    res.status(200).json(salon);
  };
}
