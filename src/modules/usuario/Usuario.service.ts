import { AppError } from "../../common/utils/App.error.js";
import { UpdateUsuarioDto } from "../auth/dtos/updateUsuario.dto.js";
import { UsuarioRepository } from "./Usuario.repository.js";

export class UsuarioService {
  private usuarioRepo = UsuarioRepository;

  async listarUsuarios(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [usuarios, total] = await this.usuarioRepo.findAndCount({
      skip,
      take: limit,
      order: {
        idCliente: "ASC",
      },
    });

    return {
      data: usuarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerUsuarioById(idCliente: string) {
    const usuario = await this.usuarioRepo.findOneBy({ idCliente });
    return usuario;
  }

  async obtenerIntitucionesXUsuario(idCliente: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idCliente },
      relations: ["usuarioInstituciones", "usuarioInstituciones.idInstitucion"],
    });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return usuario.usuarioInstituciones.map((ui) => ui.idInstitucion);
  }

  async editarUsuario(idCliente: string, datos: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { idCliente } });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    Object.assign(usuario, datos);

    return await this.usuarioRepo.save(usuario);
  }
}
