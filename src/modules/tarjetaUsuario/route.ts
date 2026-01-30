import { Router } from "express";
import { TarjetaUsuarioService } from "./service.js";
import { TarjetaUsuarioController } from "./controller.js";

const router = Router();
const tarjetaUsuarioService =  new TarjetaUsuarioService();
const tarjetaUsuarioController = new TarjetaUsuarioController(tarjetaUsuarioService);

router.get("/tarjeta/:idTarjeta", tarjetaUsuarioController.obtenerTarjetaXId);
router.get("/tarjeta/:idUsuario", tarjetaUsuarioController.obtenerTarjetaXIdUsuario);
router.post("/tarjeta/:idCliente", tarjetaUsuarioController.guardarTarjetaPaymentez);
router.delete("/tarjeta/:idTarjeta", tarjetaUsuarioController.eliminarTarjeta);