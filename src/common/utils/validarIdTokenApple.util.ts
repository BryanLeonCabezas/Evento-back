// Verificación del identity token de Apple (Sign in with Apple), análogo a validarIdTokenGoogle.
import { createRemoteJWKSet, jwtVerify } from "jose";
import { TipoUsuarioEnum } from "../enums/TipoUsuario.enum.js";
import { UsuarioDto } from "../../modules/auth/dtos/usuario.dto.js";
import { AppError } from "./App.error.js";
import { env } from "../../config/env.js";

// JWKS remoto de Apple (cacheado por jose) para verificar la FIRMA del identity token.
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);
const APPLE_ISSUER = "https://appleid.apple.com";

export const validarIdTokenApple = async (
  identityToken: string,
  hint?: { email?: string; nombre?: string; apellido?: string },
): Promise<UsuarioDto> => {
  if (!env.jwt.appleClientIds.length) {
    throw new AppError("Apple Sign-In no está configurado", 500);
  }

  let payload: any;
  try {
    // Verifica firma (JWKS de Apple) + issuer + audience (bundle id) + expiración.
    const res = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: APPLE_ISSUER,
      audience: env.jwt.appleClientIds,
    });
    payload = res.payload;
  } catch (error: any) {
    throw new AppError(
      "Token de Apple inválido o expirado",
      401,
      error.message,
    );
  }

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new AppError("Token de Apple inválido", 401);

  // El email del TOKEN es la fuente confiable (Apple lo marca verificado). El del
  // hint (DTO) solo se usa si el token no trae email; nunca para tomar una cuenta ajena.
  const tokenEmail =
    typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";
  const email =
    tokenEmail && emailVerified
      ? tokenEmail
      : hint?.email
        ? hint.email.trim().toLowerCase()
        : null;
  if (!email) throw new AppError("Apple no proporcionó un email", 401);

  const UsuarioDto: UsuarioDto = {
    email,
    nombre: hint?.nombre,
    apellido: hint?.apellido,
    appleId: sub,
    tipoUsuario: TipoUsuarioEnum.APPLE,
  };

  return UsuarioDto;
};
