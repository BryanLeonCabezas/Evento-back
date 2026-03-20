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
import { In } from "typeorm";

interface PaymentezCard {
  holder_name: string;
  number: string;
  bin: string;
  type: string;
  transaction_reference: string;
  status: string;
  token: string;
  expiry_month: string;
  expiry_year: string;
}

export class TarjetaUsuarioService {
  private tarjetaUsuarioRepository = tarjetaUsuarioRepository;
  private usuarioRepository = UsuarioRepository;
  private paymentezProvider = new PaymentezProvider();

  private mapTarjetasDB(
    tarjetas: TarjetasUsuario[],
  ): TarjetaUsuarioResponseDto[] {
    return tarjetas.map((t) => ({
      idTarjeta: t.idTarjeta,
      brand: t.tipo,
      brandName:
        PaymentezBrandNombre[t.tipo as PaymentezBrand] ?? "DESCONOCIDO",
      last4: t.last4,
      bin: t.bin ?? "",
      expMonth: t.expiryMonth,
      expYear: t.expiryYear,
      banco: t.banco ?? "",
      holderName: t.holderName ?? "",
      predeterminado: t.predeterminado === PredeterminadoTarjeta.SI,
    }));
  }

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

    //Tarjetas DB
    const tarjetasDB = await this.tarjetaUsuarioRepository.find({
      where: {
        usuario: { idCliente: idUsuario },
        status: EstadoTarjeta.ACTIVA,
      },
      order: {
        idTarjeta: "DESC",
      },
    });

    console.log(`Tarjetas en DB para usuario ${idUsuario}:`, tarjetasDB);
    if (tarjetasDB.length === 0) {
      return { tarjetas: [] };
    }

    let tarjetasPaymentez: PaymentezCard[] = [];

    try {
      const paymentezResponse =
        await this.paymentezProvider.listCards(idUsuario);
      tarjetasPaymentez = paymentezResponse?.cards ?? [];
    } catch (error) {
      console.error("Error consultando tarjetas en Paymentez:", error);
      // Si Paymentez falla, devolvemos solo lo que tenemos en BD
      // para no bloquear al usuario (decisión de negocio, ajustar si se requiere)
      return { tarjetas: this.mapTarjetasDB(tarjetasDB) };
    }

    const paymentezByToken = new Map(
      tarjetasPaymentez.map((c) => [c.token, c]),
    );

    // 4. Separar tarjetas válidas de huérfanas (existen en BD pero no en Paymentez)
    const tarjetasValidas: TarjetasUsuario[] = [];
    const tarjetasHuerfanas: TarjetasUsuario[] = [];

    for (const tarjeta of tarjetasDB) {
      if (paymentezByToken.has(tarjeta.token)) {
        tarjetasValidas.push(tarjeta);
      } else {
        tarjetasHuerfanas.push(tarjeta);
      }
    }

    if (tarjetasHuerfanas.length > 0) {
      const idsHuerfanas = tarjetasHuerfanas.map((t) => t.idTarjeta);
      console.warn(
        `Inactivando ${idsHuerfanas.length} tarjeta(s) huérfana(s) para usuario ${idUsuario}:`,
        idsHuerfanas,
      );

      this.tarjetaUsuarioRepository
        .update(
          { idTarjeta: In(idsHuerfanas) },
          { predeterminado: 0, status: EstadoTarjeta.INACTIVA },
        )
        .catch((err) =>
          console.error("Error inactivando tarjetas huérfanas:", err),
        );
    }

    const tarjetasResponse: TarjetaUsuarioResponseDto[] = tarjetasValidas.map(
      (t) => {
        const paymentezCard = paymentezByToken.get(t.token)!;
        return {
          idTarjeta: t.idTarjeta,
          brand: t.tipo,
          brandName:
            PaymentezBrandNombre[t.tipo as PaymentezBrand] ?? "DESCONOCIDO",
          last4: t.last4,
          bin: t.bin ?? "",
          expMonth: t.expiryMonth,
          expYear: t.expiryYear,
          banco: t.banco ?? "",
          holderName: paymentezCard.holder_name, // ← Paymentez como fuente de verdad
          predeterminado: t.predeterminado === PredeterminadoTarjeta.SI,
        };
      },
    );

    return { tarjetas: tarjetasResponse };
  }

  async guardarTarjetaPaymentez(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: any,
  ) {
    const [usuario, tarjetaExistente] = await Promise.all([
      this.usuarioRepository.findOne({ where: { idCliente } }),
      this.tarjetaUsuarioRepository.findOne({
        where: {
          token: dto.token,
          usuario: { idCliente },
          status: EstadoTarjeta.ACTIVA,
        },
      }),
    ]);

    if (!usuario) throw new AppError("Usuario no encontrado", 404);

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

    const tarjeta = this.tarjetaUsuarioRepository.create({
      // ← .create() en vez de new
      usuario,
      token: dto.token,
      email: usuario.email,
      last4: dto.last4,
      tipo: dto.type || "DESCONOCIDO",
      banco: dto.bankName || null,
      bin: dto.bin || null,
      transactionReference: dto.transactionReference || null,
      origin: dto.origin || null,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      status: EstadoTarjeta.ACTIVA,
      holderName: dto.holderName || null,
      predeterminado: 0,
    });

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
    if (!idUsuario || idUsuario.trim() === "")
      throw new AppError("ID de usuario inválido", 400);

    if (!idTarjeta || idTarjeta <= 0)
      throw new AppError("ID de tarjeta inválido", 400);

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        idTarjeta,
        usuario: { idCliente: idUsuario },
        status: EstadoTarjeta.ACTIVA,
      },
      relations: ["usuario"],
    });

    if (!tarjeta)
      throw new AppError("Tarjeta no encontrada para el usuario", 404);

    await this.tarjetaUsuarioRepository.manager.transaction(async (manager) => {
      await manager.update(
        TarjetasUsuario,
        {
          usuario: { idCliente: idUsuario },
          status: EstadoTarjeta.ACTIVA,
        },
        {
          predeterminado: PredeterminadoTarjeta.NO,
        },
      );

      await manager.update(
        TarjetasUsuario,
        { idTarjeta },
        { predeterminado: PredeterminadoTarjeta.SI },
      );
    });

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

  async obtenerTarjetaPredeterminada(idUsuario: string) {
    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
    where: {
      usuario: { idCliente: idUsuario },
      predeterminado: PredeterminadoTarjeta.SI,
      status: EstadoTarjeta.ACTIVA,
    },
  });

    if (!tarjeta) {
      return {
        message: "No se encontró tarjeta predeterminada para el usuario",
        data: null,
      };
    }

    const tarjetaResponse: TarjetaUsuarioResponseDto = {
      idTarjeta: tarjeta.idTarjeta,
      brand: tarjeta.tipo,
      brandName:
        PaymentezBrandNombre[tarjeta.tipo as PaymentezBrand] || "DESCONOCIDO",
      last4: tarjeta.last4,
      bin: tarjeta.bin ?? "",
      expMonth: tarjeta.expiryMonth,
      expYear: tarjeta.expiryYear,
      banco: tarjeta.banco ?? "",
      holderName: tarjeta.holderName ?? "",
      predeterminado:
        tarjeta.predeterminado == PredeterminadoTarjeta.SI ? true : false,
    };

    return {
      message: "Tarjeta predeterminada encontrada",
      data: tarjetaResponse,
    };
  }
}
