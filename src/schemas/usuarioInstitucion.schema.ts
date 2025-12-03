import z from "zod/v3";

export const VincularInstitucionSchema = z.object({
  idCliente: z.string(),
  codigoConexion: z.string(),
});
