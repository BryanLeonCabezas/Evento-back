import { Router } from "express";
import { UsuarioService } from "./service.js";
import { UsuarioController } from "./controller.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { editUserSchema } from "../../schemas/editarUsuario.schema.js";

const router = Router();
const usuarioService = new UsuarioService();
const usuarioController = new UsuarioController(usuarioService);

router.get("/", usuarioController.listarUsuarios);
router.get("/:idCliente/instituciones", usuarioController.obtenerIntitucionesXUsuario);
router.get("/:idCliente", usuarioController.obtenerUsuarioById);
router.put(
  "/:idCliente",
  validateSchema(editUserSchema),
  usuarioController.editarUsuario
);

export default router;
