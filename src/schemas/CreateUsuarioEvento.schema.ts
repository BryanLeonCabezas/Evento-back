import z from "zod/v3";
import { TipoUsuarioEnum } from "../common/enums/TipoUsuario.enum.js";
import { GeneroEnum } from "../common/enums/Genero.enum.js";

const commonFields = {
  email: z
    .string()
    .email("El email no es válido")
    .max(150, "El email no puede superar 150 caracteres"),

  nombre: z.string().max(100, "El nombre no puede superar 100 caracteres"),
  apellido: z.string().max(100, "El apellido no puede superar 100 caracteres"),
};

const normalUserSchema = z.object({
  ...commonFields,
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),

  genero: z.nativeEnum(GeneroEnum),

  direccion: z
    .string()
    .max(250, "La dirección no puede superar 250 caracteres")
    .optional(),

  claveHash: z.string(),
  tipoUsuario: z.literal(TipoUsuarioEnum.NORMAL),
  numeroCelular: z.string(),
});

const googleUserSchema = z.object({
  idToken: z.string(),
  accessToken: z.string(),
  tipoUsuario: z.literal(TipoUsuarioEnum.GOOGLE),
});

export const crearUsuarioSchema = z.discriminatedUnion("tipoUsuario", [
  normalUserSchema,
  googleUserSchema,
]);
