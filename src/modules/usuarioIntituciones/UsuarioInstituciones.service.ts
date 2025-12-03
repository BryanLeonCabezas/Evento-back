import { AppError } from "../../common/utils/App.error.js";
import { institucionRepository } from "../instituciones/Instituciones.repository.js";
import { UsuarioRepository } from "../usuario/Usuario.repository.js";
import { usuarioInstitucionesReposiroty } from "./UsuarioInstituciones.repository.js";

export class UsuarioInstitucionesService {
  private usuarioInstitucionesReposiroty = usuarioInstitucionesReposiroty;
  private institucionesRepository = institucionRepository;
  private usuariosRepository = UsuarioRepository;

  async vincularUsuarioAInstitucion(idCliente: string, codigoConexion: string) {
    const [usuario, institucion] = await Promise.all([
      this.usuariosRepository.findOneBy({ idCliente }),
      this.institucionesRepository.findOneBy({ codigoConexion }),
    ]);

    if (!usuario) throw new AppError("El usuario no existe", 400);
    if (!institucion) throw new AppError("La institucion no existe", 400);
    console.log("usuario", usuario);
    console.log("institucion", institucion);

    const existeRelacion = await this.usuarioInstitucionesReposiroty.findOne({
      where: {
        idCliente: usuario.idCliente as any,
        idInstitucion: institucion.idInstitucion as any,
      },
    });

    console.log("existeRelacion", existeRelacion);

    if (existeRelacion)
      throw new AppError("El usuario ya esta vinculado a la institucion", 400);

    const relacion = this.usuarioInstitucionesReposiroty.save({
      idInstitucion: institucion,
      idCliente: usuario,
    });

    return {
      message: "Usuario asociado correctamente",
    };
  }
}
