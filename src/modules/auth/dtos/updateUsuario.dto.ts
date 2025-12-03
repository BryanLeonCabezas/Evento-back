import { GeneroEnum } from "../../../common/enums/Genero.enum.js";

export class UpdateUsuarioDto {
    nombre?: string;
    apellido?: string;
    genero?: GeneroEnum;
    direccion?: string;
    fotoUrl?: string;
    numeroCelular?: string;
  }
  