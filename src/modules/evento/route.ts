import { Router } from "express";
import { EventoService } from "./service.js";
import { EventoController } from "./controller.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";


const router = Router();

const eventoService = new EventoService();
const eventosController = new EventoController(eventoService);

router.get("/usuario/:idCliente", asyncWrapper(eventosController.getEventos));
router.get("/inicio/:idCliente", asyncWrapper(eventosController.getHomeEventos)); // Ruta para eventos próximos
router.get("/:id/usuario/:idCliente", asyncWrapper(eventosController.getEventoById));


export default router;