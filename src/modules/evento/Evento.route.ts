import { Router } from "express";
import { EventoService } from "./Evento.service.js";
import { EventoController } from "./Evento.controller.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";


const router = Router();

const eventoService = new EventoService();
const eventosController = new EventoController(eventoService);

router.get("/", asyncWrapper(eventosController.getEventos));


export default router;