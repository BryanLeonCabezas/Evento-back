import { Router } from "express";
import { InstitucionesService } from "./service.js";
import { InstitucionesController } from "./controller.js";

const router = Router();

const institucionService = new InstitucionesService();
const institucionController = new InstitucionesController(institucionService);

router.get("/", institucionController.listarInstituciones);
router.get("/:idInstitucion", institucionController.obtenerInstitucionById);

export default router;