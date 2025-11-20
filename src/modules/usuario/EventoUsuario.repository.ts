import { AppDataSource } from "../../data-source.js";
import { CrearUsuarioDto } from "../auth/CrearUsuario.dto.js";
import { EventosUsuarios } from "./EventoUsuario.entity.js";



export const eventoUsuarioRepository = AppDataSource.getRepository(EventosUsuarios);

