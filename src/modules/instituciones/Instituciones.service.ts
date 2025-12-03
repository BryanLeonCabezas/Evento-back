import { AppError } from "../../common/utils/App.error.js";
import { AppDataSource } from "../../data-source.js";
import { institucionRepository } from "./Instituciones.repository.js";

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
}
