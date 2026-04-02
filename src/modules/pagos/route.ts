import { Router } from "express";
import { PagosService } from "./service.js";
import { PagoController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

const pagoService = new PagosService();
const pagoController = new PagoController(pagoService);

router.get(
  "/evento/:idEvento/cliente/:idCliente",
  authMiddleware,
  pagoController.obtenerDetallePago
);

export default router;

