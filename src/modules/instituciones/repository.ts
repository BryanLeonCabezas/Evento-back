import { AppDataSource } from "../../data-source.js";
import { Instituciones } from "./entity.js";

export const institucionRepository = AppDataSource.getRepository(Instituciones);
