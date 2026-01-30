import { AppDataSource } from "../../data-source.js";
import { TarjetasUsuario } from "./entity.js";

export const tarjetaUsuarioRepository = AppDataSource.getRepository(TarjetasUsuario);