export interface CrearArchivoDto {
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
  idCertificado?: number;

  tipoArchivo:
    | "PORTADA"
    | "GALERIA"
    | "LOGO"
    | "BANNER"
    | "DOCUMENTO"
    | "CROQUIS"
    | "LOGO";
}
