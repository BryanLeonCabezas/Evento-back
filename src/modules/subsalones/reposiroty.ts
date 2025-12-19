import { AppDataSource } from "../../data-source.js";
import { Subsalones } from "./entity.js";

export const subsalonesReposiroty = AppDataSource.getRepository(Subsalones);