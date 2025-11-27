// src/app.routes.ts
import { Router } from "express";
import usuarioRoutes from "./modules/usuario/Usuario.route.js";
import authRoutes from "./modules/auth/Auth.route.js";
import eventoRoutes from "./modules/evento/Evento.route.js";
const router = Router();

// EVENTO USUARIO ENDPOINT
router.use("/auth", authRoutes);
router.use("/usuario", usuarioRoutes);
router.use("/evento", eventoRoutes);


export default router;
