// src/modules/auth/utils/validarIdToken.util.ts

import { OAuth2Client } from "google-auth-library";
import { CrearUsuarioDto } from "../../modules/auth/CrearUsuario.dto.js";
import { TipoUsuarioEnum } from "../enums/TipoUsuario.enum.js";
import { GoogleApis, google } from "googleapis";
import { GeneroEnum } from "../enums/Genero.enum.js";
import { UsuarioDto } from "../../modules/auth/dtos/usuario.dto.js";
import { AppError } from "./App.error.js";
import { env } from "../../config/env.js";

const client = new OAuth2Client(env.jwt.googleClientId);

const genderMap: Record<string, GeneroEnum> = {
  male: GeneroEnum.HOMBRE,
  female: GeneroEnum.MUJER,
  other: GeneroEnum.OTRO,
  unspecified: GeneroEnum.UNSPECIFIED,
};

export const validarIdTokenGoogle = async (
  idToken: string,
  accessToken: string
): Promise<UsuarioDto> => {
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: env.jwt.googleClientId,
    });
  } catch (error: any) {
    throw new AppError(
      "Token de Google inválido o expirado",
      401,
      error.message
    );
  }


  const payload = ticket.getPayload();
  if (!payload) throw new Error("Token inválido");

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const peopleService = google.people({
    version: "v1",
    auth: oauth2Client,
  });
  let person;
  try {
    const response = await peopleService.people.get({
      resourceName: "people/me",
      personFields: "genders,birthdays,addresses,phoneNumbers,organizations",
    });
    person = response.data;
  } catch (error: any) {
    throw new AppError(
      "No se pudo obtener los datos del perfil de Google",
      401,
      "GOOGLE_OAUTH_ACCESS_DENIED",
      error.response?.data ?? null
    );
  }

  const rawGender =
    person.genders?.find((g) => g.metadata?.primary)?.value || null;

  const genero: GeneroEnum = rawGender
    ? genderMap[rawGender.toLowerCase()]
    : GeneroEnum.UNSPECIFIED;

  const birthday =
    person.birthdays?.find((b) => b.date?.year) || person.birthdays?.[0];

  
  let fechaNacimientoDate = null;

  if (birthday?.date) {
    const year = birthday.date.year!;
    const month = birthday.date.month!; // 1-12
    const day = birthday.date.day!;

    // Crear fecha local sin timezone
    fechaNacimientoDate = new Date(year, month - 1, day);
  }

  const address = person.addresses;
  const phone = person.phoneNumbers;
  const organization = person.organizations;

  const UsuarioDto: UsuarioDto = {
    email: payload.email!,
    nombre: payload.given_name,
    apellido: payload.family_name,
    fotoUrl: payload.picture,
    googleId: payload.sub,
    genero: genero,
    fechaNacimiento: fechaNacimientoDate,
    tipoUsuario: TipoUsuarioEnum.GOOGLE,
  };

  return UsuarioDto;
};
