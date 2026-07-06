import { Router } from "express";
import { ArchivosService } from "./service.js";
import { ArchivosController } from "./controller.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

const archivosService = new ArchivosService();
const archivosController = new ArchivosController(archivosService);

router.post("/", upload.single("archivo"), archivosController.guardarArchivo);
router.get("/activo", archivosController.obtenerActivo);
router.get("/:idArchivo", archivosController.obtenerArchivo);

export default router;
