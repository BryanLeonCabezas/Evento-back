import { TipoUsuarioEnum } from "../../common/enums/TipoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { hashPassword } from "../../common/utils/crypto.util.js";
import { validarIdTokenGoogle } from "../../common/utils/validarIdToken.util.js";
import { eventoUsuarioRepository } from "../usuario/EventoUsuario.repository.js";
import { CrearUsuarioDto } from "./CrearUsuario.dto.js";
import { CrearUsuarioGoogleDto } from "./dtos/CrearUsuarioGoogle.dto.js";
import jwt from "jsonwebtoken";
export class AuthService {
  private repoUsuario = eventoUsuarioRepository;

  async registerUserPassword(dto: CrearUsuarioDto) {
    let usuario;

    const exist = await this.repo.findOneBy({ email: dto.email });
    if (exist) throw new AppError("El correo ya se encuentra registrado", 400);

    usuario = this.repo.create({
      ...dto,
      idCliente: crypto.randomUUID(),
      claveHash: hashPassword(dto.claveHash!),
      tipoUsuario: TipoUsuarioEnum.NORMAL,
    });

    await this.repo.save(usuario);

    return {
      message: "Usuario creado con éxito",
      tipoUsuario: usuario.tipoUsuario,
    };
  }
  async authGoogle(dto: CrearUsuarioGoogleDto) {
    const usuarioGoogle = await validarIdTokenGoogle(
      dto.idToken!,
      dto.accessToken!
    );
    //console.log(usuarioGoogle);

    let usuario = await this.repoUsuario.findOneBy({
      email: usuarioGoogle.email,
    });

    let isNewUser = false;

    if (!usuario) {
      isNewUser = true;

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
