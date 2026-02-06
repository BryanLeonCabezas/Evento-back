import { Router } from "express";
import { EntradaEventoService } from "./service.js";
import { EntradaEventoController } from "./controller.js";

const router = Router();

const entradaEventoService = new EntradaEventoService();
const entradaEventoController = new EntradaEventoController(entradaEventoService);

router.get("/evento/:idEvento/cliente/:idCliente", entradaEventoController.getEntradaPorEventoYCliente);
router.post("/", entradaEventoController.registrarEntradaCompra);
router.delete("/:idEntrada", entradaEventoController.cancelarEntrada);
router.post("/validar", entradaEventoController.validarEntrada);

export default router;
