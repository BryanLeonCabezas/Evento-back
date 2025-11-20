// src/modules/auth/utils/validarIdToken.util.ts

import { OAuth2Client } from "google-auth-library";
import { CrearUsuarioDto } from "../../modules/auth/CrearUsuario.dto.js";
import { TipoUsuarioEnum } from "../enums/TipoUsuario.enum.js";
import { GoogleApis, google } from "googleapis";
import { GeneroEnum } from "../enums/Genero.enum.js";
import { UsuarioDto } from "../../modules/auth/dtos/usuario.dto.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

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

  const { data: person } = await peopleService.people.get({
    resourceName: "people/me",
    personFields: "genders,birthdays,addresses,phoneNumbers,organizations",
  });

  const rawGender =
    person.genders?.find((g) => g.metadata?.primary)?.value || null;

  const genero: GeneroEnum = rawGender
    ? genderMap[rawGender.toLowerCase()]
    : GeneroEnum.UNSPECIFIED;

  const birthday =
    person.birthdays?.find((b) => b.date?.year) || person.birthdays?.[0];

  const fechaNacimiento = birthday?.date
    ? `${birthday.date.year ?? "0000"}-${birthday?.date.month
        ?.toString()
        .padStart(2, "0")}-${birthday.date.day?.toString().padStart(2, "0")}`
    : undefined;

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
    fechaNacimiento: fechaNacimiento,
    tipoUsuario: TipoUsuarioEnum.GOOGLE,
  };

  return UsuarioDto;
};
