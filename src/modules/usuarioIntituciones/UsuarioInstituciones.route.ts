import { Router } from "express";
import { UsuarioInstitucionesService } from "./UsuarioInstituciones.service.js";
import { UsuarioInstitucionesController } from "./UsuarioInstituciones.controller.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { VincularInstitucionSchema } from "../../schemas/usuarioInstitucion.schema.js";

const router = Router();

const usuariosInstitucionesService = new UsuarioInstitucionesService();
const usuariosInstitucionesController = new UsuarioInstitucionesController(
  usuariosInstitucionesService
);

router.post(
  "/vincular-usuario-institucion",
  validateSchema(VincularInstitucionSchema),
  usuariosInstitucionesController.registerUserPassword
);

export default router;
