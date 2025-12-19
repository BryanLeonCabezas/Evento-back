import { AppError } from "../../common/utils/App.error.js";
import { salonRepository } from "./repository.js";

export class SalonesService {
  private salonRepository = salonRepository;

  async obtenerSalonesXLocal(idLocal: number) {
    const salones = await this.salonRepository
      .createQueryBuilder("s")
      .innerJoin("s.idLocal", "l")
      .where("l.idLocal = :idLocal", { idLocal })
      .getMany();

    if (!salones || salones.length === 0) {
      throw new AppError("Salones no encontrados", 404);
    }

    return salones;
  }

  async obtenerSalonById(idSalon: number) {
    const salon = await this.salonRepository.findOneBy({ idSalon });
    if (!salon) {
      throw new AppError("Salon no encontrado", 404);
    }
    return salon;
  }
}
