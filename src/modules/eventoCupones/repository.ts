import { AppDataSource } from "../../data-source.js";
import { EventoCupones } from "./entity.js";

export const eventoCuponesRepository = AppDataSource.getRepository(EventoCupones)