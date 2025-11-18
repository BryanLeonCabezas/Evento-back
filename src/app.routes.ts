// src/app.routes.ts
import { Router } from "express";
import usuarioRoutes from "./modules/usuario/EventoUsuario.route.js";

const router = Router();

// EVENTO USUARIO ENDPOINT
router.use("/auth", usuarioRoutes);



export default router;
