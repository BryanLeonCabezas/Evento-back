import { Router } from "express";
import * as controller from "./controller.js";

const router = Router();

router.get("/cards/:userId", controller.listarTarjetas);
router.delete("/cards", controller.eliminarTarjeta);
router.post("/debit", controller.debitar);
router.post("/init-reference", controller.initReference);

export default router;