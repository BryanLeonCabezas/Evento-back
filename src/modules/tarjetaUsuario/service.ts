import { id, th } from "zod/locales";
import { PaymentLogService } from "../../common/logs/payment-logs.js";
import { AppError } from "../../common/utils/App.error.js";
import { UsuarioRepository } from "../usuario/repository.js";
import { GuardarTarjetaDto, TarjetaUsuarioResponseDto } from "./dto.js";
import { TarjetasUsuario } from "./entity.js";
import { tarjetaUsuarioRepository } from "./repository.js";
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";
import { PaymentezProvider } from "../payments/providers/paymentez.js";
import { PredeterminadoTarjeta } from "../../common/enums/predeterminadoTarjeta.enum.js";
import { PaymentezBrandNombre } from "../../common/utils/ValidateRoutes.util.js";
import { PaymentezBrand } from "../../common/enums/brandTarjeta.enum.js";
export class TarjetaUsuarioService {
  private tarjetaUsuarioRepository = tarjetaUsuarioRepository;
  private usuarioRepository = UsuarioRepository;
  private paymentezProvider = new PaymentezProvider();

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

    let tarjetasResponse: TarjetaUsuarioResponseDto[];
    tarjetasResponse = tarjetas.map((t) => ({
      idTarjeta: t.idTarjeta,
      brand: t.tipo,
      brandName:
        PaymentezBrandNombre[t.tipo as PaymentezBrand] || "DESCONOCIDO",
      last4: t.last4,
      bin: t.bin ?? "",
      expMonth: t.expiryMonth,
      expYear: t.expiryYear,
      banco: t.banco ?? "",
      predeterminado:
        t.predeterminado == PredeterminadoTarjeta.SI ? true : false,
    }));

    console.log("tarjetas encontradas para usuario", idUsuario, tarjetas);

    return { tarjetas: tarjetasResponse };
  }

  async guardarTarjetaPaymentez(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: any,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idCliente },
    });

    console.log("usuario", usuario);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const tarjetaExistente = await this.tarjetaUsuarioRepository.findOne({
      where: {
        token: dto.token,
        usuario: { idCliente },
        status: EstadoTarjeta.ACTIVA,
      },
    });

    console.log("tarjetaExistente", tarjetaExistente);
    if (tarjetaExistente) {
      await this.tarjetaUsuarioRepository.update(
        { idTarjeta: tarjetaExistente.idTarjeta },
        {
          predeterminado: 0,
          status: EstadoTarjeta.INACTIVA,
        },
      );

      await PaymentLogService.logTarjetaEvento({
        idCliente,
        email: usuario.email,
        tipoEvento: "TARJETA_INACTIVADA",
        status: "OK",
        mensaje: "Se inactivó tarjeta anterior para registrar una nueva",
        response: paymentezResponse,
      });
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
    tarjeta.status = EstadoTarjeta.ACTIVA;
    tarjeta.holderName = dto.holderName || null;
    tarjeta.predeterminado = 0;

    const tarjetaGuardada = await this.tarjetaUsuarioRepository.save(tarjeta);

    await PaymentLogService.logTarjetaEvento({
      idCliente,
      email: usuario.email,
      tipoEvento: "GUARDAR_TARJETA_PAYMENTEZ",
      status: "OK",
      mensaje: "Tarjeta guardada correctamente",
      statusDetail: paymentezResponse?.transaction?.status_detail,
    });

    return tarjetaGuardada;
  }

  async eliminarTarjeta(idTarjeta: number) {
    if (!idTarjeta || idTarjeta <= 0) {
      throw new AppError("ID de tarjeta inválido", 400);
    }

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: { idTarjeta },
      relations: ["usuario"],
    });
    console.log("Tarjeta a eliminar", tarjeta);
    if (!tarjeta) {
      throw new AppError("Tarjeta no encontrada", 404);
    }

    if (tarjeta.status === EstadoTarjeta.INACTIVA) {
      return {
        message: "La tarjeta ya se encontraba inactiva",
      };
    }
    console.log(
      "Eliminando tarjeta en Paymentez con token",
      tarjeta.token,
      "y userId",
      tarjeta.usuario.idCliente,
    );
    const result = await this.paymentezProvider.deleteCard(
      tarjeta.usuario.idCliente,
      tarjeta.token,
    );
    console.log("Resultado eliminación tarjeta Paymentez", result);
    if (!result) {
      throw new AppError("No se pudo eliminar la tarjeta en Paymentez", 400);
    }

    await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      {
        predeterminado: 0,
        status: EstadoTarjeta.INACTIVA,
      },
    );

    return {
      message: "Tarjeta eliminada correctamente",
    };
  }

  async establecerPredeterminada(idUsuario: string, idTarjeta: number) {
    if (!idUsuario || idUsuario.trim() === "") {
      throw new AppError("ID de usuario inválido", 400);
    }

    if (!idTarjeta || idTarjeta <= 0) {
      throw new AppError("ID de tarjeta inválido", 400);
    }

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        idTarjeta,
        usuario: { idCliente: idUsuario },
        status: EstadoTarjeta.ACTIVA,
      },
      relations: ["usuario"],
    });

    if (!tarjeta) {
      throw new AppError("Tarjeta no encontrada para el usuario", 404);
    }

    await this.tarjetaUsuarioRepository.update(
      {
        usuario: { idCliente: idUsuario },
        status: EstadoTarjeta.ACTIVA,
      },
      {
        predeterminado: PredeterminadoTarjeta.NO,
      },
    );

    await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      {
        predeterminado: PredeterminadoTarjeta.SI,
      },
    );

    await PaymentLogService.logTarjetaEvento({
      idCliente: idUsuario,
      email: tarjeta.usuario.email,
      tipoEvento: "TARJETA_PREDETERMINADA",
      status: "OK",
      mensaje: `Tarjeta ${tarjeta.last4} establecida como predeterminada`,
    });

    return {
      message: "Tarjeta establecida como predeterminada",
    };
  }
}
