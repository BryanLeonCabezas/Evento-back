import { Request, Response } from "express";
import { UsuarioInstitucionesService } from "./UsuarioInstituciones.service.js";

export class UsuarioInstitucionesController {
  constructor(
    private usuarioInstitucionesService: UsuarioInstitucionesService
  ) {}

  registerUserPassword = async (req: Request, res: Response) => {
    try {
      const { idCliente, codigoConexion } = req.body;
      const usuario =
        await this.usuarioInstitucionesService.vincularUsuarioAInstitucion(
          idCliente,
          codigoConexion
        );
      res.status(201).json(usuario);
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  };
}
