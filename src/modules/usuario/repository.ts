import { AppDataSource } from "../../data-source.js";
import { Usuarios } from "./entity.js";



export const UsuarioRepository = AppDataSource.getRepository(Usuarios);

