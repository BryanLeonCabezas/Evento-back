// src/modules/auth/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "./Auth.controller.js";
import { AuthService } from "./Auth.service.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { crearUsuarioSchema } from "../../schemas/CreateUsuario.schema.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post(
  "/register-google",
  validateSchema(crearUsuarioSchema),
  asyncWrapper(authController.registerGoogle)
);

router.post(
  "/register-user-password",
  validateSchema(crearUsuarioSchema),
  asyncWrapper(authController.registerUserPassword)
);

router.post(
  "/login-user-password",
  asyncWrapper(authController.loginUserPassword)
);

export default router;
