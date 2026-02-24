import { EventoListDto } from "./evento-list.js";

export interface EventosPorInstitucionDto {
  institucion: {
    idInstitucion: number;
    nombre: string;
    direccion: string | null;
    ciudad: string | null;
    eventos: EventoListDto[];
  };
  
}
