export interface CrearArchivoDto {
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
  idSalon?: number;
  idSubsalon?: number;
  idConfiguracion?: number;

  tipoArchivo:
    | "PORTADA"
    | "GALERIA"
    | "LOGO"
    | "BANNER"
    | "DOCUMENTO"
    | "CROQUIS"
    | "LOGO";
}
