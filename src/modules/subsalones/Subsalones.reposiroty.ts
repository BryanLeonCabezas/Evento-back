import { AppDataSource } from "../../data-source.js";
import { Subsalones } from "./Subsalones.entity.js";

export const subsalonesReposiroty = AppDataSource.getRepository(Subsalones);