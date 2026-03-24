import { TipoUsuarioEnum } from "../../common/enums/TipoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import {
  comparePassword,
  hashPassword,
} from "../../common/utils/crypto.util.js";
import { validarIdTokenGoogle } from "../../common/utils/validarIdToken.util.js";
import { UsuarioRepository } from "../usuario/repository.js";
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
        hasPassword: !!usuario.claveHash,
        fotoUrl: usuario.fotoUrl,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loginUserPassword(email: string, password: string) {
    console.log("Login user password", email, password);

    if (!email || !password) throw new AppError("Faltan datos", 400);

    const usuario = await this.repoUsuario.findOneBy({ email });
    if (!usuario) throw new AppError("El usuario no existe", 400);

    if (usuario.tipoUsuario === TipoUsuarioEnum.GOOGLE && !usuario.claveHash)
      throw new AppError("El usuario no puede iniciar sesion", 400);

    const passwordCorrect = comparePassword(password, usuario.claveHash!);

    if (!passwordCorrect) throw new AppError("Contrasena incorrecta", 400);

    const { accessToken, refreshToken } = this.generateTokens({
      idCliente: usuario.idCliente,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

    usuario.refreshToken = refreshToken;
    await this.repoUsuario.save(usuario);

    return {
      message: "Login exitoso",
      usuario: {
        idUsuario: usuario.idCliente,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        hasPassword: !!usuario.claveHash,
        fotoUrl: usuario.fotoUrl,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }



  async logout(idCliente: string) {
    console.log("Logout", idCliente);

    const usuario = await this.repoUsuario.findOneBy({ idCliente });
    console.log("usuario", usuario);

    if (!usuario) throw new AppError("El usuario no existe", 400);

    usuario.refreshToken = null;

    await this.repoUsuario.save(usuario);

    return {
      message: "Logout exitoso",
    };
  }

  async refreshToken(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError("Refresh token requerido", 400);
  } 
  console.log("Refresh token recibido:", refreshToken);

  let decoded: any;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    console.log("Refresh token verificado:", decoded);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Refresh token expirado", 401);
    }
    throw new AppError("Refresh token inválido", 401);
  }

  // Validar que el token exista en DB
  const usuario = await this.repoUsuario.findOneBy({
    idCliente: decoded.idCliente,
    refreshToken: refreshToken,
  });

  if (!usuario) {
    throw new AppError("Sesión inválida", 401);
  }

  // Generar nuevos tokens
  const { accessToken, refreshToken: newRefreshToken } =
    this.generateTokens({
      idCliente: usuario.idCliente,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

  // Rotar refresh token
  usuario.refreshToken = newRefreshToken;
  await this.repoUsuario.save(usuario);

  return {
    token: accessToken,
    refreshToken: newRefreshToken,
  };
}

  async obtenerInfoUsuarioAutenticado(idCliente: string) {
    const usuario = await this.repoUsuario.findOne({
      where: { idCliente: idCliente },
      relations: ["usuarioInstituciones", "usuarioInstituciones.idInstitucion"],
    });
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return usuario;
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
