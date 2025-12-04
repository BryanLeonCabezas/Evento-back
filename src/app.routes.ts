// src/app.routes.ts
import { Router } from "express";
import usuarioRoutes from "./modules/usuario/Usuario.route.js";
import authRoutes from "./modules/auth/Auth.route.js";
import eventoRoutes from "./modules/evento/Evento.route.js";
import institucionRoutes from "./modules/instituciones/Instituciones.route.js";
import localesRoutes from "./modules/locales/Locales.route.js";
import usuarioInstitucionRoutes from "./modules/usuarioIntituciones/UsuarioInstituciones.route.js";
import salonesRoutes from "./modules/salones/Salones.route.js";
import subsalonesRoutes from "./modules/subsalones/Subsalones.route.js";
import eventosUsuariosRoutes from "./modules/eventoUsuario/EventosUsuarios.route.js";
const router = Router();

// EVENTO USUARIO ENDPOINT
router.use("/auth", authRoutes);
router.use("/usuario", usuarioRoutes);
router.use("/evento", eventoRoutes);
router.use("/institucion", institucionRoutes);
router.use("/institucion-usuario", usuarioInstitucionRoutes);
router.use("/locales", localesRoutes);
router.use("/salones",salonesRoutes);
router.use("/subsalones",subsalonesRoutes);
router.use("/evento-usuario",eventosUsuariosRoutes);

export default router;
