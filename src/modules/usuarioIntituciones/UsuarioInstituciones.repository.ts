import { AppDataSource } from "../../data-source.js";
import { UsuarioInstituciones } from "./UsuarioInstituciones.entity.js";

export const usuarioInstitucionesReposiroty = AppDataSource.getRepository(UsuarioInstituciones);