
import { TipoUsuarioEnum } from "../../../common/enums/TipoUsuario.enum.js";

export class CrearUsuarioGoogleDto {
    googleId?: string;
    tipoUsuario?: TipoUsuarioEnum;
    idToken?: string;
    accessToken?:string;
  }
  