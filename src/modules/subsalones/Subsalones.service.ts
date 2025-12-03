import { AppError } from "../../common/utils/App.error.js";
import { subsalonesReposiroty } from "./Subsalones.reposiroty.js";

export class SubsalonesService {
  private subsalonesReposiroty = subsalonesReposiroty;

  async obtenerSalonesXId(idSubsalon: number) {
    return await this.subsalonesReposiroty.findOneBy({ idSubsalon });
  }

  async obtenersubsalonesXSalon(idSalon: number) {
    const salones = await this.subsalonesReposiroty
      .createQueryBuilder("s")
      .innerJoin("s.idSalon", "l")
      .where("l.idSalon = :idSalon", { idSalon })
      .getMany();

    if (!salones || salones.length === 0) {
      throw new AppError("subsalones no encontrados", 404);
    }

    return salones;
  }
}
