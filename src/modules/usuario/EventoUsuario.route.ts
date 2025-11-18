import { Router } from "express";
import { crearUsuarioHandler } from "./EventoUsuario.controller.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { crearUsuarioSchema } from "../../schemas/CreateUsuarioEvento.schema.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";

const router = Router();

router.post("/register",validateSchema(crearUsuarioSchema), asyncWrapper(crearUsuarioHandler));

export default router;