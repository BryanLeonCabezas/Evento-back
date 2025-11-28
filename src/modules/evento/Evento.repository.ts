import { AppDataSource } from "../../data-source.js";
import { Eventos } from "./Evento.entity.js";




export const eventoRepository = AppDataSource.getRepository(Eventos);

