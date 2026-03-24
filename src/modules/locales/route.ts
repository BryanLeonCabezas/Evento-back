import { Router } from "express";
import { LocalesService } from "./service.js";
import { LocalesController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const route = Router();

const localesService = new LocalesService();
const localesController = new LocalesController(localesService);

route.get("/:idInstitucion/instituciones", authMiddleware, localesController.obtenerLocalesXInstitucion);

route.get("/:idLocal", authMiddleware, localesController.obtenerLocalById);

export default route;