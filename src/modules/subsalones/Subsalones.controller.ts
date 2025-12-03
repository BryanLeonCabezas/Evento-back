import { Request, Response } from "express";
import { SubsalonesService } from "./Subsalones.service.js";

export class SubsalonesController {
  constructor(private subsalonesService: SubsalonesService) {}

  obtenerSalonesXId = async (req: Request, res: Response) => {
    const idSubsalon = Number(req.params.idSubsalon);
    const salones = await this.subsalonesService.obtenerSalonesXId(idSubsalon);
    res.status(200).json(salones);
  };

  obtenerSubsalonesXSalon = async (req: Request, res: Response) => {
    const idSalon = Number(req.params.idSalon);
    const salones = await this.subsalonesService.obtenersubsalonesXSalon(idSalon);
    res.status(200).json(salones);
  };
}
