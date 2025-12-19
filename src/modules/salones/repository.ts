import { AppDataSource } from "../../data-source.js";
import { Salones } from "./entity.js";

export const salonRepository = AppDataSource.getRepository(Salones);