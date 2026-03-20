export interface EventoListDto {
  idEvento: number;
  titulo: string;
  descripcion: string;
  fechaEvento: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  imagenUrl: string;
  precio: number;
  destacado: number;
  ordenDestacado?: number;
  publicoEsperado?: number | null;
  tiempoSetupMin?: number | null;
  tiempoCleanMin?: number | null;
  fechaRegistro?: string | null;

  salon: {
    idSalon: number;
    nombre: string;
  };

  subsalon?: {
    idSubsalon: number;
    nombre: string;
  } | null;

  local: {
    nombre: string;
    ubicacion: string | null;
    descripcion: string | null;
  };

  institucion?: {
    idInstitucion: number;
    nombre: string;
    direccion: string | null;
    ciudad: string | null;
  };
  adquirido: boolean;
  fechaCompra?: string | null;
  QR?: string | null;
  estaActivo: boolean;
}
