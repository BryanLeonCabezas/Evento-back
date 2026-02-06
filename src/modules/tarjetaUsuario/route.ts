import { Router } from "express";
import { TarjetaUsuarioService } from "./service.js";
import { TarjetaUsuarioController } from "./controller.js";
import { de } from "zod/locales";

const router = Router();
const tarjetaUsuarioService =  new TarjetaUsuarioService();
const tarjetaUsuarioController = new TarjetaUsuarioController(tarjetaUsuarioService);

router.get("/id/:idTarjeta", tarjetaUsuarioController.obtenerTarjetaXId);
router.get("/usuario/:idUsuario", tarjetaUsuarioController.obtenerTarjetaXIdUsuario);
router.post("/:idCliente", tarjetaUsuarioController.guardarTarjetaPaymentez);
router.delete("/:idTarjeta", tarjetaUsuarioController.eliminarTarjeta);

export default router;