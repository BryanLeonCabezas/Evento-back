import { Router } from "express";
import { TarjetaUsuarioService } from "./service.js";
import { TarjetaUsuarioController } from "./controller.js";
import { de } from "zod/locales";

const router = Router();
const tarjetaUsuarioService =  new TarjetaUsuarioService();
const tarjetaUsuarioController = new TarjetaUsuarioController(tarjetaUsuarioService);

router.get("/id/:idTarjeta", tarjetaUsuarioController.obtenerTarjetaXId);
router.get("/usuario/:idUsuario", tarjetaUsuarioController.obtenerTarjetaXIdUsuario);
router.get("/predeterminada/:idUsuario", tarjetaUsuarioController.obtenerTarjetaPredeterminada);
router.post("/:idCliente", tarjetaUsuarioController.guardarTarjetaPaymentez);
router.post("/predeterminada/:idCliente", tarjetaUsuarioController.establecerPredeterminada);
router.delete("/:idTarjeta", tarjetaUsuarioController.eliminarTarjeta);

export default router;