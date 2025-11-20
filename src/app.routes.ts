// src/app.routes.ts
import { Router } from "express";
import usuarioRoutes from "./modules/usuario/EventoUsuario.route.js";
import authRoutes from "./modules/auth/Auth.route.js";
const router = Router();

// EVENTO USUARIO ENDPOINT
router.use("/auth", authRoutes);
router.use("/usuario", usuarioRoutes);


export default router;
