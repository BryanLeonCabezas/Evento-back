import { PaymentLogService } from "../../common/logs/payment-logs.js";
import { AppError } from "../../common/utils/App.error.js";
import { UsuarioRepository } from "../usuario/repository.js";
import { GuardarTarjetaDto } from "./dto.js";
import { TarjetasUsuario } from "./entity.js";
import { tarjetaUsuarioRepository } from "./repository.js";
export class TarjetaUsuarioService {
  private tarjetaUsuarioRepository = tarjetaUsuarioRepository;
  private usuarioRepository = UsuarioRepository;
  async obtenerTarjetaXId(idTarjeta: number) {
    return await this.tarjetaUsuarioRepository.findOneBy({ idTarjeta });
  }

  async obtenerTarjetaXIdUsuario(idUsuario: number) {
    return await this.tarjetaUsuarioRepository.findOne({
      where: { usuario: { idUsuario } },
    });
  }

  async guardarTarjetaPaymentez(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: any,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idCliente },
    });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const tarjetaExistente = await this.tarjetaUsuarioRepository.findOne({
      where: {
        usuario: { idCliente },
        cardToken: dto.token,
      },
    });

    if (tarjetaExistente) {
      await PaymentLogService.logTarjetaEvento({
        idCliente,
        email: usuario.email,
        tipoEvento: "TARJETA_DUPLICADA",
        status: "OK",
        mensaje: "La tarjeta ya se encontraba registrada",
        response: paymentezResponse,
      });
      return tarjetaExistente;
    }

    const tarjeta = new TarjetasUsuario();
    tarjeta.usuario = usuario;
    tarjeta.cardToken = dto.token;
    tarjeta.last4 = dto.last4;
    tarjeta.brand = dto.brand;
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
    return await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      { deletedAt: new Date(), status: "INACTIVE" },
    );
  }
}
