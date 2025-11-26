import { TipoUsuarioEnum } from "../../common/enums/TipoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { hashPassword } from "../../common/utils/crypto.util.js";
import { validarIdTokenGoogle } from "../../common/utils/validarIdToken.util.js";
import { UsuarioRepository } from "../usuario/Usuario.repository.js";
import { CrearUsuarioDto } from "./CrearUsuario.dto.js";
import { CrearUsuarioGoogleDto } from "./dtos/CrearUsuarioGoogle.dto.js";
import jwt from "jsonwebtoken";
export class AuthService {
  private repoUsuario = UsuarioRepository;

  async registerUserPassword(dtoUsuario: CrearUsuarioDto) {
    let usuario;

    const exist = await this.repoUsuario.findOneBy({ email: dtoUsuario.email });
    if (exist) throw new AppError("El correo ya se encuentra registrado", 400);

    usuario = this.repoUsuario.create({
      ...dtoUsuario,
      idCliente: crypto.randomUUID(),
      claveHash: hashPassword(dtoUsuario.claveHash!),
      tipoUsuario: TipoUsuarioEnum.NORMAL,
    });

    await this.repoUsuario.save(usuario);

    return {
      message: "Usuario creado con éxito",
      tipoUsuario: usuario.tipoUsuario,
    };
  }
  async authGoogle(dtoUsuarioGoogle: CrearUsuarioGoogleDto) {
    const usuarioGoogle = await validarIdTokenGoogle(
      dtoUsuarioGoogle.idToken!,
      dtoUsuarioGoogle.accessToken!
    );
    //console.log(usuarioGoogle);

    let usuario = await this.repoUsuario.findOneBy({
      email: usuarioGoogle.email,
    });

    let isNewUser = false;

    if (!usuario) {
      isNewUser = true;

      console.log("usuarioGoogle", usuarioGoogle.fechaNacimiento);

      usuario = this.repoUsuario.create({
        ...usuarioGoogle,
        idCliente: crypto.randomUUID(),
        tipoUsuario: TipoUsuarioEnum.GOOGLE,
      });
    }

    console.log("usuario", usuario);

    let token;
    console.log("Generando token para usuario:", usuario.email);
    console.log(process.env.JWT_SECRET!);
    console.log(process.env.JWT_REFRESH_SECRET!);

    const { accessToken, refreshToken } = this.generateTokens({
      idCliente: usuario.idCliente,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

    usuario.refreshToken = refreshToken;

    await this.repoUsuario.save(usuario);

    return {
      message: isNewUser ? "Usuario creado con éxito" : "Login exitoso",
      usuario: {
        idUsuario: usuario.idCliente,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        nombre: usuarioGoogle.nombre,
        apellido: usuarioGoogle.apellido,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  generateTokens(payload: any) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "30d",
    });

    return { accessToken, refreshToken };
  }
}
