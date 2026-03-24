import { Router } from "express";
import { SalonesService } from "./service.js";
import { SalonesController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const route = Router();

const salonesService = new SalonesService();
const salonesController = new SalonesController(salonesService);

route.get("/:idLocal/locales", authMiddleware, salonesController.obtenerSalonesXLocal);
route.get("/:idSalon", authMiddleware, salonesController.obtenerSalonById);

export default route;