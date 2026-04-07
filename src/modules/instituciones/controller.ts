import { Request, Response } from "express";
import { InstitucionesService } from "./service.js";

export class InstitucionesController {
  constructor(private institucionService: InstitucionesService) { }

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

  obtenerInstitucionByidUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario;
    console.log('obtenerInstitucionByidUsuario llamado con idUsuario:', idUsuario);
    const instituciones = await this.institucionService.obtenerInstitucionByidUsuario(idUsuario);
    res.status(200).json(instituciones);
  };

  obtenerCredencialesTokenizacion = async (req: Request, res: Response) => {
    const idInstitucion = Number(req.params.idInstitucion);
    const credenciales = await this.institucionService.obtenerCredencialesTokenizacion(idInstitucion);
    res.status(200).json(credenciales);
  };
}
