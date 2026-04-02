import { TipoUsuarioEnum } from "../../common/enums/TipoUsuario.enum.js";
import { verificadoEnum } from "../../common/enums/verificado.enum copy.js";
import { AppError } from "../../common/utils/App.error.js";
import {
  comparePassword,
  generateVerificationToken,
  hashPassword,
  hashToken,
} from "../../common/utils/crypto.util.js";
import { validarIdTokenGoogle } from "../../common/utils/validarIdToken.util.js";
import { sendVerificationEmail } from "../../services/external/correo.js";
import { UsuarioRepository } from "../usuario/repository.js";
import { CrearUsuarioDto } from "./CrearUsuario.dto.js";
import { CrearUsuarioGoogleDto } from "./dtos/CrearUsuarioGoogle.dto.js";
import jwt from "jsonwebtoken";
export class AuthService {
  private repoUsuario = UsuarioRepository;

  async registerUserPassword(dtoUsuario: CrearUsuarioDto) {
    let usuario;

    const exist = await this.repoUsuario.findOneBy({ email: dtoUsuario.email });

    if (
      exist &&
      exist.isVerified &&
      exist.isVerified === verificadoEnum.NO_VERIFICADO
    ) {
      const { token, hashedToken } = generateVerificationToken();

      exist.verificationToken = hashedToken;
      exist.tokenExpira = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await this.repoUsuario.save(exist);

      try {
        await sendVerificationEmail({
          correo: exist.email,
          nombre: exist.nombre!,
          linkVerification: `http://localhost:3000/api/auth/verify?token=${token}&idCliente=${exist.idCliente}`,
        });
      } catch (e) {
        console.error("Error reenviando correo:", e);
      }

      return {
        message:
          "Tu cuenta aún no está verificada. Te enviamos un nuevo enlace de verificación.",
      };
    }

    if (
      exist &&
      exist.isVerified &&
      exist.isVerified === verificadoEnum.VERIFICADO
    )
      throw new AppError("El correo ya se encuentra registrado", 400);

    const fechaNacimiento = dtoUsuario.fechaNacimiento
      ? dtoUsuario.fechaNacimiento.split("T")[0]
      : null;

    const { token, hashedToken } = generateVerificationToken();
    usuario = this.repoUsuario.create({
      ...dtoUsuario,
      fechaNacimiento,
      idCliente: crypto.randomUUID(),
      claveHash: hashPassword(dtoUsuario.claveHash!),
      tipoUsuario: TipoUsuarioEnum.NORMAL,

      verificationToken: hashedToken,
      isVerified: 0, // No verificado hasta que confirme su correo
      tokenExpira: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    console.log("Usuario a registrar:", usuario);

    await this.repoUsuario.save(usuario);

    //Envio de correo de verificacion
    await sendVerificationEmail({
      correo: usuario.email,
      nombre: usuario.nombre!,
      linkVerification: `http://localhost:3000/api/auth/verify?token=${token}&idCliente=${usuario.idCliente}`,
    });

    return {
      message:
        "Usuario creado correctamente. Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.",
      tipoUsuario: usuario.tipoUsuario,
    };
  }

  async authGoogle(dtoUsuarioGoogle: CrearUsuarioGoogleDto) {
    const usuarioGoogle = await validarIdTokenGoogle(
      dtoUsuarioGoogle.idToken!,
      dtoUsuarioGoogle.accessToken!,
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

    if (
      usuario.tipoUsuario === TipoUsuarioEnum.NORMAL &&
      usuario.isVerified === verificadoEnum.NO_VERIFICADO
    )
      throw new AppError(
        "Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo electrónico.",
        403,
      );

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
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
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

  async verifyAccount(token: string, idCliente?: string) {
    if (!token || !idCliente) {
      throw new AppError("Token e idCliente son requeridos", 400);
    }

    const tokenLimpio = token.trim();
    const idClienteLimpio = idCliente.trim();

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idClienteLimpio)) {
      throw new AppError("Parámetros inválidos", 400);
    }

    // Hashear token recibido
    const hashedToken = hashToken(token);

    // Buscar usuario
    const usuario = await this.repoUsuario.findOne({
      where: {
        verificationToken: hashedToken,
        ...(idCliente && { idCliente }),
      },
    });

    if (!usuario) {
      throw new AppError("Token inválido o usuario no encontrado", 400);
    }

    // Ya verificado
    if (usuario.isVerified === verificadoEnum.VERIFICADO) {
      return {
        status: "already_verified",
        message: "La cuenta ya fue verificada anteriormente.",
      };
    }

    // Token expirado
    if (usuario.tokenExpira && new Date() > usuario.tokenExpira) {
      usuario.verificationToken = null;
      usuario.tokenExpira = null;
      await this.repoUsuario.save(usuario);
      throw new AppError("El enlace ha expirado. Solicita uno nuevo.", 410);
    }

    // Activar cuenta
    usuario.isVerified = verificadoEnum.VERIFICADO;
    usuario.verificationToken = null;
    usuario.tokenExpira = null;

    await this.repoUsuario.save(usuario);

    return { status: "verified", message: "Cuenta verificada correctamente." };
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

  // En AuthService
  async resendVerificationEmail(email: string) {
    const usuario = await this.repoUsuario.findOneBy({ email });

    if (!usuario) throw new AppError("Usuario no encontrado", 404);

    if (
      usuario.isVerified === verificadoEnum.VERIFICADO &&
      usuario.tipoUsuario === TipoUsuarioEnum.NORMAL
    ) {
      throw new AppError("La cuenta ya está verificada", 400);
    }

    // Evitar spam: verificar si el token anterior aún no expiró
    const ahoraMs = Date.now();
    const expiraMs = usuario.tokenExpira?.getTime() ?? 0;
    const minutosRestantes = (expiraMs - ahoraMs) / 1000 / 60;

    if (minutosRestantes > 23) {
      // Dejó pasar menos de 1 hora desde el último envío
      throw new AppError(
        `Espera antes de solicitar otro enlace. Revisa tu correo.`,
        429,
      );
    }

    const { token, hashedToken } = generateVerificationToken();
    usuario.verificationToken = hashedToken;
    usuario.tokenExpira = new Date(ahoraMs + 1000 * 60 * 60 * 24);
    await this.repoUsuario.save(usuario);

    await sendVerificationEmail({
      correo: usuario.email,
      nombre: usuario.nombre!,
      linkVerification: `http://localhost:3000/api/auth/verify?token=${token}&idCliente=${usuario.idCliente}`,
    });

    return { message: "Correo de verificación reenviado correctamente." };
  }
}
