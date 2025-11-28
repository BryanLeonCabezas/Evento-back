import { AppDataSource } from "../../data-source.js";
import { Instituciones } from "./Instituciones.entity.js";

export const institucionRepository = AppDataSource.getRepository(Instituciones);
