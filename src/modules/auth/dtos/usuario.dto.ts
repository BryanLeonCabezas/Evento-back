import { GeneroEnum } from "../../../common/enums/Genero.enum.js";
import { TipoUsuarioEnum } from "../../../common/enums/TipoUsuario.enum.js";

export class UsuarioDto {
  email!: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  genero?: GeneroEnum;
  direccion?: string;
  fotoUrl?: string;
  claveHash?: string;
  googleId?: string;
  tipoUsuario?: TipoUsuarioEnum;
  idToken?: string;
  accessToken?: string;
  numeroCelular?: string;
  refreshToken?: string;  
}
