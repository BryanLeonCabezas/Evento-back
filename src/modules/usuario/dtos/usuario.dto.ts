import { TipoUsuarioEnum } from "../../../common/enums/TipoUsuario.enum.js";

export class CrearUsuarioDto {
  email!: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  fotoUrl?: string;
  claveHash?: string;
  googleId?: string;
  tipoUsuario?: TipoUsuarioEnum;
}
