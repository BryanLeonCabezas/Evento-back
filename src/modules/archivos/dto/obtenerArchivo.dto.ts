export interface ObtenerArchivosDto {
  tipoEntidad:
    | "EVENTO"
    | "INSTITUCION"
    | "LOCAL"
    | "SALON"
    | "SUBSALON"
    | "CONFIGURACION"
    | "EXPOSITOR"
    | "USUARIO"
    | "CERTIFICADO";

  idEvento?: number;
  idInstitucion?: number;
  idLocal?: number;
  idSalon?: number;
  idSubsalon?: number;
  idConfiguracion?: number;
  idExpositor?: number;
  idUsuario?: string;

  tipoArchivo?: string;
}
