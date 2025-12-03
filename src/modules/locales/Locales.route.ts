import { Router } from "express";
import { LocalesService } from "./Locales.service.js";
import { LocalesController } from "./Locales.controller.js";

const route = Router();

const localesService = new LocalesService();
const localesController = new LocalesController(localesService);

route.get("/:idInstitucion/instituciones", localesController.obtenerLocalesXInstitucion);

route.get("/:idLocal", localesController.obtenerLocalById);

export default route;