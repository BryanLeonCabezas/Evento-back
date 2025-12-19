import { Router } from "express";
import { SalonesService } from "./service.js";
import { SalonesController } from "./controller.js";

const route = Router();

const salonesService = new SalonesService();
const salonesController = new SalonesController(salonesService);

route.get("/:idLocal/locales", salonesController.obtenerSalonesXLocal);
route.get("/:idSalon", salonesController.obtenerSalonById);

export default route;