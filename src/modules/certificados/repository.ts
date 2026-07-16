import { AppDataSource } from "../../data-source.js";
import { Certificado } from "./entity.js";

export const certificadoRepository = AppDataSource.getRepository(Certificado);
