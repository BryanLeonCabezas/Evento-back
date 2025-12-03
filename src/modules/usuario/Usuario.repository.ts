import { AppDataSource } from "../../data-source.js";
import { Usuarios } from "./Usuario.entity.js";



export const UsuarioRepository = AppDataSource.getRepository(Usuarios);

