import { Router } from "express";
import { EventoService } from "./service.js";
import { EventoController } from "./controller.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";
import { authMiddleware } from "../../middleware/auth.js";


const router = Router();

const eventoService = new EventoService();
const eventosController = new EventoController(eventoService);

router.get("/usuario/:idCliente",authMiddleware, asyncWrapper(eventosController.getEventos));
router.get("/inicio/:idCliente", authMiddleware, asyncWrapper(eventosController.getHomeEventos)); 
router.get("/:id/usuario/:idCliente", authMiddleware, asyncWrapper(eventosController.getEventoById));
router.get("/filtrados/:idCliente", authMiddleware, asyncWrapper(eventosController.getEventosFiltrados));

export default router;