import { AppDataSource } from "../../data-source.js";
import { EventosUsuarios } from "./EventosUsuarios.entity.js";

export const eventoUsuarioReposiroty = AppDataSource.getRepository(EventosUsuarios);