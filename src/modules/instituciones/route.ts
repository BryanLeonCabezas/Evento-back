import { Router } from "express";
import { InstitucionesService } from "./service.js";
import { InstitucionesController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";

const router = Router();

const institucionService = new InstitucionesService();
const institucionController = new InstitucionesController(institucionService);

router.get("/", authMiddleware, asyncWrapper(institucionController.listarInstituciones));
router.get(
  "/:idInstitucion",
  authMiddleware,
  asyncWrapper(institucionController.obtenerInstitucionById),
);
router.get(
  "/usuario/:idUsuario",
  
  asyncWrapper(institucionController.obtenerInstitucionByidUsuario),
);

router.get(
  "/:idInstitucion/credenciales-tokenizacion",
  authMiddleware,
  asyncWrapper(institucionController.obtenerCredencialesTokenizacion),
);

router.get(
  "/:idInstitucion/credenciales-checkout",
  authMiddleware,
  asyncWrapper(institucionController.obtenerCredencialesCheckout),
);

export default router;
