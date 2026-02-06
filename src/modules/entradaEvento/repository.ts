import { AppDataSource } from "../../data-source.js";
import { EntradasEvento } from "./entity.js";

export const entradaEventoRepository = AppDataSource.getRepository(EntradasEvento);