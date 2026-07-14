import { AppDataSource } from "../../data-source.js";
import { EventoExpositores } from "./entity.js";

export const eventoExpositoresRepository = AppDataSource.getRepository(EventoExpositores);