import { Request, Response } from "express";
import { LocalesService } from "./Locales.service.js";

export class LocalesController {
  constructor(private localesService: LocalesService) {}

  obtenerLocalesXInstitucion = async (req: Request, res: Response) => {
    const idInstitucion = Number(req.params.idInstitucion);
    console.log("idInstitucion", idInstitucion);
    
    const locales = await this.localesService.obtenerLocalesXInstitucion(
      idInstitucion
    );
    res.status(200).json(locales);
  };

  obtenerLocalById = async (req: Request, res: Response) => {
    const idLocal = Number(req.params.idLocal);
    const local = await this.localesService.obtenerLocalById(idLocal);
    res.status(200).json(local);
  };
}
