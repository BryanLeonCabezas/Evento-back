import { AppDataSource } from "../../data-source.js";
import { Eventos } from "./entity.js";




export const eventoRepository = AppDataSource.getRepository(Eventos);

