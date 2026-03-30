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
import { PaymentsService } from "../payments/service.js";
import { obtenerDatosInstitucion, obtenerInstitucionPorUsuario } from "../eventoUsuario/query.js";
import { PaymentProviderFactory } from "../payments/factory.js";
import { obtenerInstitucionPorId, usuarioPerteneceInstitucion } from "./querys.js";

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

  private async resolverPaymentsService(idInstitucion: number): Promise<PaymentsService> {
    const institucion = await obtenerInstitucionPorId(
      this.tarjetaUsuarioRepository.manager,
      idInstitucion
    );
    console.log("Institución encontrada:", institucion);
    const provider = PaymentProviderFactory.create(institucion);
    return new PaymentsService(provider);
  }

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

  async obtenerTarjetaPorIdUsuario(idUsuario: string, idInstitucion: number) {
    if (!idUsuario || idUsuario.trim() === "") {
      throw new AppError("ID de usuario inválido", 400);
    }

    const tarjetasDB = await this.tarjetaUsuarioRepository.find({
      where: {
        usuario: { idCliente: idUsuario },
        institucion: { idInstitucion },
        status: EstadoTarjeta.ACTIVA,
      },
      order: { idTarjeta: "DESC" },
    });

    if (tarjetasDB.length === 0) return { tarjetas: [] };

    let tarjetasRemotas: PaymentezCard[] = [];

    try {
      const paymentsService = await this.resolverPaymentsService(idInstitucion);
      console.log("Resolviendo servicio de pagos para usuario:", idUsuario);
      console.log("Servicio de pagos resuelto:", paymentsService);
      const response = await paymentsService.listarTarjetas(idUsuario);
      tarjetasRemotas = response?.cards ?? [];
    } catch (error) {
      console.error("Error consultando tarjetas en proveedor:", error);
      return { tarjetas: this.mapTarjetasDB(tarjetasDB) };
    }

    const remotosByToken = new Map(tarjetasRemotas.map((c) => [c.token, c]));

    const tarjetasValidas: TarjetasUsuario[] = [];
    const tarjetasHuerfanas: TarjetasUsuario[] = [];

    for (const tarjeta of tarjetasDB) {
      if (remotosByToken.has(tarjeta.token)) {
        tarjetasValidas.push(tarjeta);
      } else {
        tarjetasHuerfanas.push(tarjeta);
      }
    }

    if (tarjetasHuerfanas.length > 0) {
      const ids = tarjetasHuerfanas.map((t) => t.idTarjeta);
      this.tarjetaUsuarioRepository
        .update({ idTarjeta: In(ids) }, { predeterminado: 0, status: EstadoTarjeta.INACTIVA })
        .catch((err) => console.error("Error inactivando huérfanas:", err));
    }

    const tarjetasResponse: TarjetaUsuarioResponseDto[] = tarjetasValidas.map((t) => {
      const remota = remotosByToken.get(t.token)!;
      return {
        idTarjeta: t.idTarjeta,
        brand: t.tipo,
        brandName: PaymentezBrandNombre[t.tipo as PaymentezBrand] ?? "DESCONOCIDO",
        last4: t.last4,
        bin: t.bin ?? "",
        expMonth: t.expiryMonth,
        expYear: t.expiryYear,
        banco: t.banco ?? "",
        holderName: remota.holder_name,
        predeterminado: t.predeterminado === PredeterminadoTarjeta.SI,
      };
    });

    return { tarjetas: tarjetasResponse };
  }

  async guardarTarjetaPaymentez(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: any,
  ) {
    const [usuario, tarjetaExistente, institucion] = await Promise.all([
      this.usuarioRepository.findOne({ where: { idCliente } }),
      this.tarjetaUsuarioRepository.findOne({
        where: {
          token: dto.token,
          usuario: { idCliente },
          institucion: { idInstitucion: dto.idInstitucion },
          status: EstadoTarjeta.ACTIVA,
        },
      }),
      obtenerInstitucionPorId(this.tarjetaUsuarioRepository.manager, dto.idInstitucion)
    ]);
    console.log("Usuario encontrado para guardar tarjeta:", tarjetaExistente);
    console.log("Institución encontrada para guardar tarjeta:", institucion);
    if (!institucion) {
      throw new AppError("Institución no encontrada", 404);
    }
    const UsuarioSuscritoAInstitucion = await usuarioPerteneceInstitucion(
      this.tarjetaUsuarioRepository.manager,
      idCliente,
      dto.idInstitucion
    );
    if (!usuario) throw new AppError("Usuario no encontrado", 404);
    if (!UsuarioSuscritoAInstitucion) throw new AppError("El usuario no está suscrito a la institución", 400);
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
      institucion: { idInstitucion: dto.idInstitucion }
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

  async eliminarTarjeta(idTarjeta: number, idInstitucion: number) {
    if (!idTarjeta || idTarjeta <= 0) {
      throw new AppError("ID de tarjeta inválido", 400);
    }

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: { idTarjeta, institucion: { idInstitucion } },
      relations: ["usuario", "institucion"],
    });

    if (!tarjeta) throw new AppError("Tarjeta no encontrada", 404);
    if (tarjeta.status === EstadoTarjeta.INACTIVA) {
      return { message: "La tarjeta ya se encontraba inactiva" };
    }

    // resuelve el proveedor a partir del usuario dueño de la tarjeta
    const paymentsService = await this.resolverPaymentsService(tarjeta.idInstitucion);

    const result = await paymentsService.eliminarTarjeta(
      tarjeta.usuario.idCliente,
      tarjeta.token,
    );

    if (!result) throw new AppError("No se pudo eliminar la tarjeta en el proveedor", 400);

    await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      { predeterminado: 0, status: EstadoTarjeta.INACTIVA }
    );

    return { message: "Tarjeta eliminada correctamente" };
  }

  async establecerPredeterminada(idUsuario: string, idTarjeta: number, idInstitucion: number) {
    if (!idUsuario || idUsuario.trim() === "")
      throw new AppError("ID de usuario inválido", 400);

    if (!idTarjeta || idTarjeta <= 0)
      throw new AppError("ID de tarjeta inválido", 400);

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        idTarjeta,
        usuario: { idCliente: idUsuario },
        institucion: { idInstitucion },
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
          institucion: { idInstitucion },
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

  async obtenerTarjetaPredeterminada(idUsuario: string, idInstitucion: number) {
    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        usuario: { idCliente: idUsuario },
        institucion: { idInstitucion },
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
