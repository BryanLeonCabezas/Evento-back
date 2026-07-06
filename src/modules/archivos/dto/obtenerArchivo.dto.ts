export interface ObtenerArchivosDto {
  tipoEntidad: "EVENTO" | "INSTITUCION" | "LOCAL";

  idEvento?: number;
  idInstitucion?: number;
  idLocal?: number;

  tipoArchivo?: string;
}