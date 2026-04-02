// src/modules/auth/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "./controller.js";
import { AuthService } from "./service.js";
import {
  validateParamsSchema,
  validateSchema,
} from "../../middleware/validateSchema.js";
import { crearUsuarioSchema } from "../../schemas/CreateUsuario.schema.js";
import { asyncWrapper } from "../../common/utils/AsyncWrapper.js";
import logoutSchema from "../../schemas/logout.schema.js";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post(
  "/register-google",
  validateSchema(crearUsuarioSchema),
  asyncWrapper(authController.registerGoogle),
);

router.post(
  "/register-user-password",
  validateSchema(crearUsuarioSchema),
  asyncWrapper(authController.registerUserPassword),
);

router.post(
  "/login-user-password",
  asyncWrapper(authController.loginUserPassword),
);

router.post(
  "/logout/:idCliente",
  validateParamsSchema(logoutSchema),
  asyncWrapper(authController.logout),
);

router.get(
  "/me/:idCliente",
  validateParamsSchema(logoutSchema),
  asyncWrapper(authController.obtenerUsuarioAutenticado),
);

router.post("/refresh", asyncWrapper(authController.refresh));

router.get("/verify", asyncWrapper(authController.verifyAccount));

router.post(
  "/resend-verification-email",
  asyncWrapper(authController.resendVerificationEmail),
);

export default router;
