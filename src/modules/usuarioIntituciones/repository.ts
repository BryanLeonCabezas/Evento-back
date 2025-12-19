import { AppDataSource } from "../../data-source.js";
import { UsuarioInstituciones } from "./entity.js";

export const usuarioInstitucionesReposiroty = AppDataSource.getRepository(UsuarioInstituciones);