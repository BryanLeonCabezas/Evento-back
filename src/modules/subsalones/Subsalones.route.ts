import { Router } from "express";
import { SubsalonesService } from "./Subsalones.service.js";
import { SubsalonesController } from "./Subsalones.controller.js";

const route = Router();

const subsalonesService = new SubsalonesService();

const subsalonesController = new SubsalonesController(subsalonesService);

route.get("/:idSubsalon", subsalonesController.obtenerSalonesXId);
route.get("/:idSalon/salon", subsalonesController.obtenerSubsalonesXSalon);

export default route;
