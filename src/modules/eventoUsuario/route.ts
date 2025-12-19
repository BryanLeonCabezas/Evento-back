import { Router } from "express";
import { EventoUsuarioService } from "./service.js";
import { EventoUsuariosController } from "./controller.js";

const router = Router();

const eventoUsuarioService = new EventoUsuarioService();
const eventoUsuarioController = new EventoUsuariosController(
  eventoUsuarioService
);

router.post(
  "/eventos/:idEvento/usuarios/:idUsuario",
  eventoUsuarioController.suscribirUsuario
);
router.delete(
  "/eventos/:idEvento/usuarios/:idUsuario",
  eventoUsuarioController.eliminarSuscripcion
);

router.get(
  "/eventos/:idEvento/usuarios",
  eventoUsuarioController.obtenerUsuariosSuscritosXEvento
);
router.get(
  "/usuarios/:idUsuario/eventos",
  eventoUsuarioController.obtenerEventosXUsuario
);

export default router;
