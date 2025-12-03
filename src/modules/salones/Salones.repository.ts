import { AppDataSource } from "../../data-source.js";
import { Salones } from "./Salones.entity.js";

export const salonRepository = AppDataSource.getRepository(Salones);