export interface ObtenerArchivosDto {
  tipoEntidad:
    | "EVENTO"
    | "INSTITUCION"
    | "LOCAL"
    | "SALON"
    | "SUBSALON"
    | "CONFIGURACION";

  idEvento?: number;
  idInstitucion?: number;
  idLocal?: number;

  tipoArchivo?: string;
}
