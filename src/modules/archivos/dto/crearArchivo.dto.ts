export interface CrearArchivoDto {
  tipoEntidad: "EVENTO" | "INSTITUCION" | "LOCAL";

  idEvento?: number;
  idInstitucion?: number;
  idLocal?: number;

  tipoArchivo:
    | "PORTADA"
    | "GALERIA"
    | "LOGO"
    | "BANNER"
    | "DOCUMENTO"
    | "CROQUIS";
}