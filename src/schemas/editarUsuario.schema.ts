import z from "zod/v3";
import { GeneroEnum } from "../common/enums/Genero.enum.js";

 export const  editUserSchema = z.object({
  nombre: z.string().nonempty("El nombre es requerido").max(100, "El nombre no puede superar 100 caracteres").optional(),
  apellido: z.string().nonempty("El apellido es requerido").max(100, "El apellido no puede superar 100 caracteres").optional(),
  genero: z.nativeEnum(GeneroEnum).optional(),

  direccion: z
    .string()
    .nonempty("La direccion es requerida")
    .max(250, "La dirección no puede superar 250 caracteres")
    .optional(),

  fotoUrl: z.string().nonempty("La foto es requerida").optional(),
  numeroCelular: z.string().nonempty("El numero celular es requerido").optional(),
});
