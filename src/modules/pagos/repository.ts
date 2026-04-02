import { AppDataSource } from "../../data-source.js";
import { Pagos } from "./entity.js";


export const pagoRepository = AppDataSource.getRepository(Pagos);