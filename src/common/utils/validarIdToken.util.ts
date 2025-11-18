// src/modules/auth/utils/validarIdToken.util.ts

import { OAuth2Client } from "google-auth-library";
import { CrearUsuarioDto } from "../../modules/usuario/dtos/CrearUsuario.dto.js";
import { TipoUsuarioEnum } from "../enums/TipoUsuario.enum.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const validarIdTokenGoogle = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  console.log(payload);

  if (!payload) throw new Error("Token inválido");
  const UsuarioDto: CrearUsuarioDto = {
    email: payload.email!,
    nombre: payload.given_name,
    apellido: payload.family_name,
    fotoUrl: payload.picture,
    googleId: payload.sub,
    tipoUsuario: TipoUsuarioEnum.GOOGLE,
  };

  return UsuarioDto;
};
