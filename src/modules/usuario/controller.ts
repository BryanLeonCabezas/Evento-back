import { Request, Response } from "express";
import { UsuarioService } from "./service.js";
import { UpdatePasswordDto } from "./dto.js";

export class UsuarioController {
  constructor(private usuarioService: UsuarioService) { }

  listarUsuarios = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const usuarios = await this.usuarioService.listarUsuarios(page, limit);
    res.status(200).json(usuarios);
  };

  obtenerUsuarioById = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente;
    const usuario = await this.usuarioService.obtenerUsuarioById(idCliente);
    res.status(200).json(usuario);
  };

  obtenerIntitucionesXUsuario = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente;
    const instituciones = await this.usuarioService.obtenerIntitucionesXUsuario(
      idCliente
    );
    res.status(200).json(instituciones);
  };

  editarUsuario = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente;
    const datos = req.body;
    const usuario = await this.usuarioService.editarUsuario(idCliente, datos);
    res.status(200).json(usuario);
  };

  actualizarPassword = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente;
    const dto: UpdatePasswordDto = req.body;
    const result = await this.usuarioService.actualizarPassword(idCliente, dto);
    res.status(200).json(result);
  }
}
