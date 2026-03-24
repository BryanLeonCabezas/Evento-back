import { Request, Response } from "express";
import { InstitucionesService } from "./service.js";

export class InstitucionesController {
  constructor(private institucionService: InstitucionesService) {}

  listarInstituciones = async (req: Request, res: Response) => {
    console.log('listarInstituciones llamado');
    const instituciones = await this.institucionService.listarInstituciones();
    res.status(200).json(instituciones);
  };

  obtenerInstitucionById = async (req: Request, res: Response) => {
    const idInstitucion = Number(req.params.idInstitucion);
    const institucion = await this.institucionService.obtenerInstitucionById(
      idInstitucion
    );
    res.status(200).json(institucion);
  };
}
