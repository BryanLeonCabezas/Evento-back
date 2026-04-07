import { AppError } from "../../common/utils/App.error.js";
import { localesReposiroty } from "./reposiroty.js";

export class LocalesService {
  private localesReposiroty = localesReposiroty;

  async obtenerLocalesXInstitucion(idInstitucion: number) {
    const locales = await this.localesReposiroty.createQueryBuilder("l")
      .innerJoin("l.idInstitucion", "i")
      .where("i.idInstitucion = :idInstitucion", { idInstitucion })
      .getMany();

    if (!locales || locales.length === 0) {
      throw new AppError("Locales no encontrados", 404);
    }

    return locales;
  }

  async obtenerLocalById(idLocal: number) {
    const local = await this.localesReposiroty.findOneBy({ idLocal });
    if (!local) {
      throw new AppError("Local no encontrado", 404);
    }
    return local;
  }
}
