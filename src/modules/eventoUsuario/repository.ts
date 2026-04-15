import { AppDataSource } from "../../data-source.js";
import { EventosUsuarios } from "./entity.js";

export const eventoUsuarioRepository = AppDataSource.getRepository(EventosUsuarios);