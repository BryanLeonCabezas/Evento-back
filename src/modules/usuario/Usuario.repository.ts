import { AppDataSource } from "../../data-source.js";
import { CrearUsuarioDto } from "../auth/CrearUsuario.dto.js";
import { Usuarios } from "./Usuario.entity.js";



export const UsuarioRepository = AppDataSource.getRepository(Usuarios);

