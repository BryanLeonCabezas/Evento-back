import { Router } from "express";
import { InstitucionesService } from "./Instituciones.service.js";
import { InstitucionesController } from "./Instituciones.controller.js";

const router = Router();

const institucionService = new InstitucionesService();
const institucionController = new InstitucionesController(institucionService);

export default router;