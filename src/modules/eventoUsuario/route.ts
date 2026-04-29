import { Router } from "express";
import { EventoUsuarioService } from "./service.js";
import { EventoUsuariosController } from "./controller.js";
import { auth } from "google-auth-library";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

const eventoUsuarioService = new EventoUsuarioService();
const eventoUsuarioController = new EventoUsuariosController(
  eventoUsuarioService
);

router.post(
  "/eventos/:idEvento/usuarios/:idUsuario",
  authMiddleware,
  eventoUsuarioController.suscribirUsuario
);
router.delete(
  "/eventos/:idEvento/usuarios/:idUsuario",
  authMiddleware, 
  eventoUsuarioController.eliminarSuscripcion
);

router.get(
  "/eventos/:idEvento/usuarios",
  authMiddleware,
  eventoUsuarioController.obtenerUsuariosSuscritosXEvento
);
router.get(
  "/usuarios/:idUsuario/eventos",
  authMiddleware,
  eventoUsuarioController.obtenerEventosXUsuario
);

router.post(
  "/eventos/:idEvento/checkout",
  authMiddleware,
  eventoUsuarioController.initCheckout
);

router.post(
  "/eventos/:idEvento/checkout/confirmar",
  authMiddleware,
  eventoUsuarioController.confirmarCheckout
);

export default router;
