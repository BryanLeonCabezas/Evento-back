import { Router } from "express";
import { TarjetaUsuarioService } from "./service.js";
import { TarjetaUsuarioController } from "./controller.js";
import { de } from "zod/locales";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();
const tarjetaUsuarioService =  new TarjetaUsuarioService();
const tarjetaUsuarioController = new TarjetaUsuarioController(tarjetaUsuarioService);

router.get("/id/:idTarjeta", authMiddleware, tarjetaUsuarioController.obtenerTarjetaXId);
router.get("/usuario/:idUsuario", authMiddleware, tarjetaUsuarioController.obtenerTarjetaXIdUsuario);
router.get("/predeterminada/:idUsuario", authMiddleware, tarjetaUsuarioController.obtenerTarjetaPredeterminada);
router.post("/:idCliente", authMiddleware, tarjetaUsuarioController.guardarTarjetaPaymentez);
router.post("/predeterminada/:idCliente", authMiddleware, tarjetaUsuarioController.establecerPredeterminada);
router.delete("/:idTarjeta", authMiddleware, tarjetaUsuarioController.eliminarTarjeta);

export default router;