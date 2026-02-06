export interface EventoListDto {
  idEvento: number;
  titulo: string;
  descripcion: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  imagenUrl: string;
  precio: number;
  destacado: number;
  ordenDestacado?: number;

  salon: {
    idSalon: number;
    nombre: string;
  };

  subsalon?: {
    idSubsalon: number;
    nombre: string;
  } | null;
}
