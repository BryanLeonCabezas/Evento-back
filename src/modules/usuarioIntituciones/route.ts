import { Router } from "express";
import { UsuarioInstitucionesService } from "./service.js";
import { UsuarioInstitucionesController } from "./controller.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { VincularInstitucionSchema } from "../../schemas/usuarioInstitucion.schema.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

const usuariosInstitucionesService = new UsuarioInstitucionesService();
const usuariosInstitucionesController = new UsuarioInstitucionesController(
  usuariosInstitucionesService
);

router.post(
  "/vincular-usuario-institucion",
  authMiddleware,
  validateSchema(VincularInstitucionSchema),
  usuariosInstitucionesController.registerUserPassword
);

export default router;
