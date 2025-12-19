import { AppDataSource } from "../../data-source.js";
import { Locales } from "./entity.js";

export const localesReposiroty = AppDataSource.getRepository(Locales);