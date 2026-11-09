import { TipoUsuarioEnum } from "../../../common/enums/TipoUsuario.enum.js";

export class CrearUsuarioAppleDto {
  // JWT identity token de Apple (se verifica firma/iss/aud/exp contra las claves de Apple)
  identityToken?: string;
  // Apple entrega email/nombre SOLO en la PRIMERA autorización → el móvil los reenvía.
  email?: string;
  nombre?: string;
  apellido?: string;
  appleId?: string;
  tipoUsuario?: TipoUsuarioEnum;
}
