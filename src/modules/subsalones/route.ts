import { Router } from "express";
import { SubsalonesService } from "./service.js";
import { SubsalonesController } from "./controller.js";

const route = Router();

const subsalonesService = new SubsalonesService();

const subsalonesController = new SubsalonesController(subsalonesService);

route.get("/:idSubsalon", subsalonesController.obtenerSalonesXId);
route.get("/:idSalon/salon", subsalonesController.obtenerSubsalonesXSalon);

export default route;
