import { AppDataSource } from "../../data-source.js";
import { CrearUsuarioDto } from "../auth/CrearUsuario.dto.js";
import { Eventos } from "./Evento.entity.js";




export const eventoRepository = AppDataSource.getRepository(Eventos);

