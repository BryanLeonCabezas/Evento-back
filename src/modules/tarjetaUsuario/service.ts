import { In } from "typeorm";
import { PaymentLogService } from "../../common/logs/payment-logs.js";
import { AppError } from "../../common/utils/App.error.js";
import { UsuarioRepository } from "../usuario/repository.js";
import { GuardarTarjetaDto, TarjetaUsuarioResponseDto } from "./dto.js";
import { TarjetasUsuario } from "./entity.js";
import { tarjetaUsuarioRepository } from "./repository.js";
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";
import { PredeterminadoTarjeta } from "../../common/enums/predeterminadoTarjeta.enum.js";
import { PaymentezBrandNombre } from "../../common/utils/ValidateRoutes.util.js";
import { PaymentezBrand } from "../../common/enums/brandTarjeta.enum.js";
import { PaymentsService } from "../payments/service.js";
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

  // ─── Infraestructura interna ───────────────────────────────

  private async resolverPaymentsService(idInstitucion: number): Promise<PaymentsService> {
    const institucion = await obtenerInstitucionPorId(
      this.tarjetaUsuarioRepository.manager,
      idInstitucion,
    );
    if (!institucion) throw new AppError("Institución no encontrada", 404);
    const provider = PaymentProviderFactory.create(institucion);
    return new PaymentsService(provider);
  }

  private mapTarjeta(
    t: TarjetasUsuario,
    overrides: Partial<TarjetaUsuarioResponseDto> = {},
  ): TarjetaUsuarioResponseDto {
    return {
      idTarjeta: t.idTarjeta,
      brand: t.tipo,
      brandName: PaymentezBrandNombre[t.tipo as PaymentezBrand] ?? "DESCONOCIDO",
      last4: t.last4,
      bin: t.bin ?? "",
      expMonth: t.expiryMonth,
      expYear: t.expiryYear,
      banco: t.banco ?? "",
      holderName: t.holderName ?? "",
      predeterminado: t.predeterminado === PredeterminadoTarjeta.SI,
      ...overrides,
    };
  }

  private mapTarjetas(tarjetas: TarjetasUsuario[]): TarjetaUsuarioResponseDto[] {
    return tarjetas.map((t) => this.mapTarjeta(t));
  }

  // ─── Queries ───────────────────────────────────────────────

  async obtenerTarjetaPorId(idTarjeta: number): Promise<TarjetasUsuario> {
    if (!idTarjeta || idTarjeta <= 0) throw new AppError("ID de tarjeta inválido", 400);

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({ where: { idTarjeta } });
    if (!tarjeta) throw new AppError("Tarjeta no encontrada", 404);

    return tarjeta;
  }

  async obtenerTarjetasPorUsuario(
    idUsuario: string,
    idInstitucion: number,
  ): Promise<{ tarjetas: TarjetaUsuarioResponseDto[] }> {
    if (!idUsuario?.trim()) throw new AppError("ID de usuario inválido", 400);

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
      const response = await paymentsService.listarTarjetas(idUsuario);
      tarjetasRemotas = response?.cards ?? [];
    } catch {
      // Si el proveedor falla, devolvemos lo que tenemos en DB
      return { tarjetas: this.mapTarjetas(tarjetasDB) };
    }

    const remotosByToken = new Map(tarjetasRemotas.map((c) => [c.token, c]));

    const huerfanas: number[] = [];
    const validas: TarjetaUsuarioResponseDto[] = [];

    for (const tarjeta of tarjetasDB) {
      const remota = remotosByToken.get(tarjeta.token);
      if (remota) {
        validas.push(this.mapTarjeta(tarjeta, { holderName: remota.holder_name }));
      } else {
        huerfanas.push(tarjeta.idTarjeta);
      }
    }

    if (huerfanas.length > 0) {
      this.inactivarTarjetas(huerfanas);
    }

    return { tarjetas: validas };
  }

  async obtenerTarjetaPredeterminada(
    idUsuario: string,
    idInstitucion: number,
  ): Promise<{ message: string; data: TarjetaUsuarioResponseDto | null }> {
    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        usuario: { idCliente: idUsuario },
        institucion: { idInstitucion },
        predeterminado: PredeterminadoTarjeta.SI,
        status: EstadoTarjeta.ACTIVA,
      },
    });

    if (!tarjeta) {
      return { message: "No se encontró tarjeta predeterminada", data: null };
    }

    return {
      message: "Tarjeta predeterminada encontrada",
      data: this.mapTarjeta(tarjeta),
    };
  }

  // ─── Comandos ──────────────────────────────────────────────

  async guardarTarjeta(
    idCliente: string,
    dto: GuardarTarjetaDto,
    paymentezResponse: unknown,
  ): Promise<TarjetasUsuario> {
    const [usuario, institucion] = await Promise.all([
      this.usuarioRepository.findOne({ where: { idCliente } }),
      obtenerInstitucionPorId(this.tarjetaUsuarioRepository.manager, dto.idInstitucion),
    ]);

    if (!usuario) throw new AppError("Usuario no encontrado", 404);
    if (!institucion) throw new AppError("Institución no encontrada", 404);

    const suscrito = await usuarioPerteneceInstitucion(
      this.tarjetaUsuarioRepository.manager,
      idCliente,
      dto.idInstitucion,
    );
    if (!suscrito) throw new AppError("El usuario no está suscrito a la institución", 400);

    const tarjetaExistente = await this.tarjetaUsuarioRepository.findOne({
      where: {
        token: dto.token,
        usuario: { idCliente },
        institucion: { idInstitucion: dto.idInstitucion },
        status: EstadoTarjeta.ACTIVA,
      },
    });

    if (tarjetaExistente) {
      await this.inactivarTarjeta(tarjetaExistente.idTarjeta);
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
      usuario,
      token: dto.token,
      email: usuario.email,
      last4: dto.last4,
      tipo: dto.type ?? "DESCONOCIDO",
      banco: dto.bankName ?? null,
      bin: dto.bin ?? null,
      transactionReference: dto.transactionReference ?? null,
      origin: dto.origin ?? null,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      status: EstadoTarjeta.ACTIVA,
      holderName: dto.holderName ?? null,
      predeterminado: PredeterminadoTarjeta.NO,
      institucion: { idInstitucion: dto.idInstitucion },
    });

    const tarjetaGuardada = await this.tarjetaUsuarioRepository.save(tarjeta);

    await PaymentLogService.logTarjetaEvento({
      idCliente,
      email: usuario.email,
      tipoEvento: "GUARDAR_TARJETA",
      status: "OK",
      mensaje: "Tarjeta guardada correctamente",
      statusDetail: (paymentezResponse as any)?.transaction?.status_detail,
    });

    return tarjetaGuardada;
  }

  async eliminarTarjeta(idTarjeta: number, idInstitucion: number): Promise<{ message: string }> {
    if (!idTarjeta || idTarjeta <= 0) throw new AppError("ID de tarjeta inválido", 400);

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: { idTarjeta, institucion: { idInstitucion } },
      relations: ["usuario"],
    });

    if (!tarjeta) throw new AppError("Tarjeta no encontrada", 404);
    if (tarjeta.status === EstadoTarjeta.INACTIVA) {
      return { message: "La tarjeta ya se encontraba inactiva" };
    }

    const paymentsService = await this.resolverPaymentsService(idInstitucion);
    const eliminada = await paymentsService.eliminarTarjeta(tarjeta.usuario.idCliente, tarjeta.token);

    if (!eliminada) throw new AppError("No se pudo eliminar la tarjeta en el proveedor", 400);

    await this.inactivarTarjeta(idTarjeta);

    return { message: "Tarjeta eliminada correctamente" };
  }

  async establecerPredeterminada(
    idUsuario: string,
    idTarjeta: number,
    idInstitucion: number,
  ): Promise<{ message: string }> {
    if (!idUsuario?.trim()) throw new AppError("ID de usuario inválido", 400);
    if (!idTarjeta || idTarjeta <= 0) throw new AppError("ID de tarjeta inválido", 400);

    const tarjeta = await this.tarjetaUsuarioRepository.findOne({
      where: {
        idTarjeta,
        usuario: { idCliente: idUsuario },
        institucion: { idInstitucion },
        status: EstadoTarjeta.ACTIVA,
      },
      relations: ["usuario"],
    });

    if (!tarjeta) throw new AppError("Tarjeta no encontrada para el usuario", 404);

    await this.tarjetaUsuarioRepository.manager.transaction(async (manager) => {
      await manager.update(
        TarjetasUsuario,
        { usuario: { idCliente: idUsuario }, institucion: { idInstitucion }, status: EstadoTarjeta.ACTIVA },
        { predeterminado: PredeterminadoTarjeta.NO },
      );
      await manager.update(TarjetasUsuario, { idTarjeta }, { predeterminado: PredeterminadoTarjeta.SI });
    });

    await PaymentLogService.logTarjetaEvento({
      idCliente: idUsuario,
      email: tarjeta.usuario.email,
      tipoEvento: "TARJETA_PREDETERMINADA",
      status: "OK",
      mensaje: `Tarjeta ${tarjeta.last4} establecida como predeterminada`,
    });

    return { message: "Tarjeta establecida como predeterminada" };
  }

  // ─── Helpers privados ──────────────────────────────────────

  private async inactivarTarjeta(idTarjeta: number): Promise<void> {
    await this.tarjetaUsuarioRepository.update(
      { idTarjeta },
      { predeterminado: PredeterminadoTarjeta.NO, status: EstadoTarjeta.INACTIVA },
    );
  }

  private inactivarTarjetas(ids: number[]): void {
    this.tarjetaUsuarioRepository
      .update(
        { idTarjeta: In(ids) },
        { predeterminado: PredeterminadoTarjeta.NO, status: EstadoTarjeta.INACTIVA },
      )
      .catch((err) => console.error("Error inactivando tarjetas huérfanas:", err));
  }
}