import { id } from "zod/locales";
import { PaymentLogService } from "../../common/logs/payment-logs.js";
import { AppError } from "../../common/utils/App.error.js";
import { UsuarioRepository } from "../usuario/repository.js";
import { GuardarTarjetaDto } from "./dto.js";
import { TarjetasUsuario } from "./entity.js";
import { tarjetaUsuarioRepository } from "./repository.js";
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";
export class TarjetaUsuarioService {
  private tarjetaUsuarioRepository = tarjetaUsuarioRepository;
  private usuarioRepository = UsuarioRepository;

  async obtenerTarjetaPorId(idTarjeta: number) {
    if (!idTarjeta || idTarjeta <= 0) {
      throw new AppError("ID de tarjeta inválido", 400);
    }

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: { idTarjeta },
    });

    if (!tarjeta) {
      throw new AppError("Tarjeta no encontrada", 404);
    }

    return tarjeta;
  }

  async obtenerTarjetaPorIdUsuario(idUsuario: string) {
    if (!idUsuario || idUsuario.trim() === "") {
      throw new AppError("ID de usuario inválido", 400);
    }

    const tarjetas = await this.tarjetaUsuarioRepository.find({
      where: {
        usuario: { idCliente: idUsuario },
        status: EstadoTarjeta.ACTIVA,
      },
      order: {
        idTarjeta: "DESC",
      },
    });

    return await this.tarjetaUsuarioRepository.find({
      where: { usuario: { idCliente: idUsuario } },
    });
  }

  async guardarTarjetaPaymentez(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: any,
  ) {
    console.log("dto", dto);
    console.log("paymentezResponse", paymentezResponse);
    console.log("idCliente", idCliente);
    const usuario = await this.usuarioRepository.findOne({
      where: { idCliente },
    });

    console.log("usuario", usuario);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const tarjetaExistente = await this.tarjetaUsuarioRepository.existsBy({
      token: dto.token,
      usuario: { idCliente: usuario.idCliente },
    });
    console.log("tarjetaExistente", tarjetaExistente);
    if (tarjetaExistente) {
      await PaymentLogService.logTarjetaEvento({
        idCliente,
        email: usuario.email,
        tipoEvento: "TARJETA_DUPLICADA",
        status: "OK",
        mensaje: "La tarjeta ya se encontraba registrada",
        response: paymentezResponse,
      });
      throw new AppError("La tarjeta ya se encontraba registrada", 400);
    }

    const tarjeta = new TarjetasUsuario();
    tarjeta.usuario = usuario;
    tarjeta.token = dto.token;
    tarjeta.email = usuario.email;
    tarjeta.last4 = dto.last4;
    tarjeta.tipo = dto.type || "DESCONOCIDO";
    tarjeta.banco = dto.bankName || null;
    tarjeta.bin = dto.bin || null;
    tarjeta.transactionReference = dto.transactionReference || null;
    tarjeta.origin = dto.origin || null;
    tarjeta.expiryMonth = dto.expiryMonth;
    tarjeta.expiryYear = dto.expiryYear;
    tarjeta.status = "ACTIVE";

    const tarjetaGuardada = await this.tarjetaUsuarioRepository.save(tarjeta);

    await PaymentLogService.logTarjetaEvento({
      idCliente,
      email: usuario.email,
      tipoEvento: "GUARDAR_TARJETA_PAYMENTEZ",
      status: "OK",
      mensaje: "Tarjeta guardada correctamente",
      statusDetail: paymentezResponse?.transaction?.status_detail,
      response: paymentezResponse,
    });

    return tarjetaGuardada;
  }

  async eliminarTarjeta(idTarjeta: number) {
    if (!idTarjeta || idTarjeta <= 0) {
      throw new AppError("ID de tarjeta inválido", 400);
    }

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: { idTarjeta },
    });

    if (!tarjeta) {
      throw new AppError("Tarjeta no encontrada", 404);
    }

    if (tarjeta.status === EstadoTarjeta.INACTIVA) {
      return {
        message: "La tarjeta ya se encontraba inactiva",
      };
    }

    await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      {
        activa: 0,
        status: EstadoTarjeta.INACTIVA,
      },
    );

    return {
      message: "Tarjeta eliminada correctamente",
    };
  }
}
