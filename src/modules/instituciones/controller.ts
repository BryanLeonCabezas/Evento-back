import { Request, Response } from "express";
import { InstitucionesService } from "./service.js";

export class InstitucionesController {
  constructor(private institucionService: InstitucionesService) { }

  listarInstituciones = async (req: Request, res: Response) => {
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
    const instituciones = await this.institucionService.obtenerInstitucionByidUsuario(idUsuario);
    res.status(200).json(instituciones);
  };

  obtenerCredencialesTokenizacion = async (req: Request, res: Response) => {
    const idInstitucion = Number(req.params.idInstitucion);
    const credenciales = await this.institucionService.obtenerCredencialesTokenizacion(idInstitucion);
    res.status(200).json(credenciales);
  };

  obtenerCredencialesCheckout = async (req: Request, res: Response) => {
    const idInstitucion = Number(req.params.idInstitucion);
    const credenciales = await this.institucionService.obtenercredencialesCheckout(idInstitucion);
    res.status(200).json(credenciales);
  };
}
