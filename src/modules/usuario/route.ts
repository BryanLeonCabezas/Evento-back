import { Router } from "express";
import { UsuarioService } from "./service.js";
import { UsuarioController } from "./controller.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { editUserSchema } from "../../schemas/editarUsuario.schema.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();
const usuarioService = new UsuarioService();
const usuarioController = new UsuarioController(usuarioService);

router.get("/", authMiddleware, usuarioController.listarUsuarios);
router.get("/:idCliente/instituciones", authMiddleware, usuarioController.obtenerIntitucionesXUsuario);
router.get("/:idCliente", authMiddleware, usuarioController.obtenerUsuarioById);
router.put(
  "/:idCliente",
  validateSchema(editUserSchema),
  authMiddleware,
  usuarioController.editarUsuario
);
router.post(
  "/:idCliente/password",
  authMiddleware,
  usuarioController.actualizarPassword
);

export default router;
