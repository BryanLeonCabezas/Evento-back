import { AppDataSource } from "../../data-source.js";
import { Archivos } from "./entity.js";

export const archivosRepository = AppDataSource.getRepository(Archivos);
