import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";

export class HistorialEventosXUsuarioDto {
    idEvento?: number;
    titulo?: string;
    fechaEvento?: string;
    horaInicio?:string;
    horaFin?:string;
    estado?: EstadoEventoUsuario
    imgUrl?: string;
    precio?: number;
  }
  