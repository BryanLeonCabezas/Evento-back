import { Router } from "express";
import { SubsalonesService } from "./service.js";
import { SubsalonesController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const route = Router();

const subsalonesService = new SubsalonesService();

const subsalonesController = new SubsalonesController(subsalonesService);

route.get("/:idSubsalon", authMiddleware, subsalonesController.obtenerSalonesXId);
route.get("/:idSalon/salon", authMiddleware, subsalonesController.obtenerSubsalonesXSalon);

export default route;
