import { AppDataSource } from "../../data-source.js";
import { EventosUsuarios } from "./entity.js";

export const eventoUsuarioReposiroty = AppDataSource.getRepository(EventosUsuarios);