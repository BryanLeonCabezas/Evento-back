import { AppDataSource } from "../../data-source.js";
import { Locales } from "./Locales.entity.js";

export const localesReposiroty = AppDataSource.getRepository(Locales);