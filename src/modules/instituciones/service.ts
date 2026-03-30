import { AppError } from "../../common/utils/App.error.js";
import { AppDataSource } from "../../data-source.js";
import { obtenerInstitucionesPorUsuario } from "./query.js";
import { institucionRepository } from "./repository.js";

export class InstitucionesService {
  private institucionRepository = institucionRepository;

  async listarInstituciones() {
    return await this.institucionRepository.find();
  }

  async obtenerInstitucionById(idInstitucion: number) {
    const institucion = await this.institucionRepository.findOneBy({
      idInstitucion,
    });
    if (!institucion) {
      throw new AppError("Institucion no encontrada", 404);
    }
    return institucion;
  }

  async obtenerInstitucionByidUsuario(idUsuario: string) {
    const manager = AppDataSource.manager;
    const instituciones = await obtenerInstitucionesPorUsuario(manager, idUsuario);
    if (!instituciones || instituciones.length === 0) {
      throw new AppError("Institucion no encontrada para el usuario", 404);
    }
    return instituciones;

  }
}
