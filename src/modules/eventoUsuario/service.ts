import { email, success } from "zod";
import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { PaymentezProvider } from "../payments/providers/paymentez.js";
import {
  contarInscritos,
  obtenerDatosInstitucion,
  obtenerEvento,
  obtenerPrecioEvento,
  obtenerPublicoEsperado,
  obtenerTarjetaUsuario,
  obtenerUsuario,
  usuarioYaInscrito,
} from "./query.js";
import { eventoUsuarioReposiroty } from "./repository.js";
import { Transactional } from "typeorm-transactional";
import { log } from "console";
import { HistorialEventosXUsuarioDto } from "./dto.js";
import {
  formatLocalDate,
  formatTime,
} from "../../common/utils/ValidateRoutes.util.js";
import { generarCodigoQR } from "../../common/utils/crypto.util.js";
import { ca } from "zod/locales";
import { EventosUsuarios } from "./entity.js";
import { Brackets } from "typeorm";
import { PaymentsService } from "../payments/service.js";
import { PaymentProviderFactory } from "../payments/factory.js";
import { PagosService } from "../pagos/service.js";
import { GatewayMapperFactory } from "../pagos/mappers/gateway-mapper.factory.js";
import { PagoNormalizado } from "../pagos/dto/pago-normalizado.dto.js";

export class EventoUsuarioService {
  private eventoUsuarioReposiroty = eventoUsuarioReposiroty;
  private pagosService = new PagosService();

  //private paymentezProvider = new PaymentezProvider();

  private mapToHistorialEventosXUsuarioDto(
    evento: any,
  ): HistorialEventosXUsuarioDto {
    return {
      idEvento: evento.IDEVENTO,
      titulo: evento.TITULO,
      fechaEvento: formatLocalDate(evento.FECHAEVENTO),
      horaInicio: formatTime(evento.HORAINICIO),
      horaFin: formatTime(evento.HORAFIN),
      estado: evento.ESTADO as EstadoEventoUsuario,
      imgUrl: evento.IMGURL,
    };
  }

  async suscribirUsuario(
    idEvento: number,
    idUsuario: string,
    estado: EstadoEventoUsuario = EstadoEventoUsuario.SUSCRITO,
    observacion?: string,
    idTarjeta?: number,
  ) {
    return await this.eventoUsuarioReposiroty.manager.transaction(
      async (manager) => {
        const [
          evento,
          institucion,
          publicoEsperado,
          inscritosAlEvento,
          tarjetaUsuario,
          usuario,
          usuarioInscrito,
        ] = await Promise.all([
          obtenerEvento(manager, idEvento),
          obtenerDatosInstitucion(manager, idEvento),
          obtenerPublicoEsperado(manager, idEvento),
          contarInscritos(manager, idEvento),
          obtenerTarjetaUsuario(manager, idTarjeta, idUsuario),
          obtenerUsuario(manager, idUsuario),
          usuarioYaInscrito(manager, idEvento, idUsuario),
        ]);

        if (!evento) throw new AppError("Evento no encontrado", 404);
        if (usuarioInscrito)
          throw new AppError("El usuario ya está suscrito a este evento", 400);
        if (inscritosAlEvento.INSCRITOS >= publicoEsperado.PUBLICO_ESPERADO)
          throw new AppError("El evento ha alcanzado su capacidad máxima", 400);
        const precioEvento = evento.PRECIO;
        let paymentsService: PaymentsService | null = null;
        let pagoNormalizado: PagoNormalizado;
        let transaccion: any = null;
        const nombrePasarela: string =
          institucion.PROVEEDOR_PAGO ?? "paymentez";
        // ── CASO 1: Evento gratuito ──────────────────────────────────────────
        if (precioEvento === 0) {
          pagoNormalizado = {
            transaccionId: null,
            pasarela: null,
            estado: "GRATUITO",
            detalleEstado: "Evento sin costo",
            monto: 0,
            moneda: "USD",
            metodoPago: null,
            marcaTarjeta: null,
            ultimos4: null,
            responseJson: null,
            tipo: "GRATUITO",
          };
        } else {
         
          // ── CASO 2: Evento de pago ─────────────────────────────────────────
          if (!tarjetaUsuario || Object.keys(tarjetaUsuario).length === 0)
            throw new AppError(
              "El evento requiere un método de pago válido",
              400,
            );

          const provider = PaymentProviderFactory.create(institucion);
          paymentsService = new PaymentsService(provider);
          const mapper = GatewayMapperFactory.create(nombrePasarela);
          const responsePago = await paymentsService.debitar({
            userId: idUsuario,
            cardToken: tarjetaUsuario.TOKEN,
            amount: precioEvento,
            description: `Pago por inscripción al evento ${evento.TITULO}`,
            email: usuario.EMAIL,
          });


          transaccion = responsePago?.transaction;
          pagoNormalizado = mapper.mapDebito(responsePago);

          // ── CASO 3: Pago fallido → guardar en PAGOS y lanzar error ────────
          if (pagoNormalizado.tipo === "FALLIDO") {
            await this.pagosService.registrarFueraTransaccion({
              normalizado: pagoNormalizado,
              idEvento,
              idCliente: idUsuario,
              eventoUsuario: null,
            });
            throw new AppError(
              "No se pudo procesar el pago. Verifica tu método de pago.",
              400,
            );
          }
        }

        // ── Guardar inscripción + pago dentro de la transacción ─────────────
        try {
          const nuevoRegistro = manager.create(EventosUsuarios, {
            idEvento: { idEvento },
            idCliente: { idCliente: idUsuario },
            estado: EstadoEventoUsuario.SUSCRITO,
            observacion,
            qrToken: generarCodigoQR("TCK"),
          });

          const eventoUsuarioGuardado = await manager.save(nuevoRegistro);

          // Guardar pago (exitoso o gratuito) vinculado a la inscripción
          await this.pagosService.registrarEnTransaccion(manager, {
            normalizado: pagoNormalizado,
            idEvento,
            idCliente: idUsuario,
            eventoUsuario: eventoUsuarioGuardado,
          });

          return {
            message:
              precioEvento > 0
                ? "Pago realizado e inscripción confirmada"
                : "Inscripción confirmada (evento gratuito)",
            data: {
              idEvento,
              nombreEvento: evento.TITULO,
              transaccionId: transaccion?.id ?? null,
            },
            success: true,
          };
        } catch (error) {
          // ── CASO 4: Pago OK pero falló la BD → reembolsar y registrar ──────
          if (transaccion?.id) {
            try {
              const mapper = GatewayMapperFactory.create(nombrePasarela);
              const responseReembolso = await paymentsService!.reembolsar({
                transactionId: transaccion.id,
                amount: precioEvento,
                moreInfo: true,
              });

              // Fuera de la transacción porque ya fue revertida
              await this.pagosService.registrarFueraTransaccion({
                normalizado: mapper.mapReembolso(
                  responseReembolso,
                  precioEvento,
                ),
                idEvento,
                idCliente: idUsuario,
                eventoUsuario: null,
              });

            } catch (refundError) {
              console.error(
                "CRITICO: Reembolso fallido:",
                transaccion.id,
                refundError,
              );
            }
          }

          throw new AppError(
            "Error al registrar la inscripción. Tu pago ha sido reembolsado.",
            500,
          );
        }
      },
    );
  }

  async eliminarSuscripcion(idEvento: number, idUsuario: string) {
    const result = await this.eventoUsuarioReposiroty.manager
      .createQueryBuilder()
      .update("EVENTOS_USUARIOS")
      .set({
        estado: EstadoEventoUsuario.CANCELADO,
        observacion: "Usuario se desuscribió",
      })
      .where("ID_CLIENTE = :idCliente", { idCliente: idUsuario })
      .andWhere("ID_EVENTO = :idEvento", { idEvento })
      .andWhere("ESTADO = :estado", { estado: EstadoEventoUsuario.SUSCRITO })
      .execute();

    if (result.affected === 0) {
      throw new AppError("El usuario no está suscrito al evento", 400);
    }

    return { message: "Usuario desuscrito correctamente" };
  }

  async obtenerUsuariosSuscritosXEvento(idEvento: number) {
    if (!idEvento || idEvento <= 0) {
      throw new AppError("ID de evento inválido", 400);
    }
    const usuarios = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .innerJoin("eu.idCliente", "u")
      .innerJoin("eu.idEvento", "e")
      .where("e.idEvento = :idEvento", { idEvento })
      .andWhere("eu.estado = 'A'")
      .select([
        "u.idCliente AS idCliente",
        "u.nombre AS nombre",
        "u.email AS email",
      ])
      .getRawMany();

    return {
      total: usuarios.length,
      data: usuarios,
    };
  }

  async obtenerEventosSuscritosXUsuario(idUsuario: string) {
    if (!idUsuario || idUsuario.trim() === "") {
      throw new AppError("ID de usuario inválido", 400);
    }

    const eventos = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .innerJoin("eu.idEvento", "e")
      .innerJoin("eu.idCliente", "u")
      .where("u.idCliente = :idCliente", { idCliente: idUsuario })
      .andWhere("eu.estado = 'A'")
      .select([
        "e.idEvento AS idEvento",
        "e.titulo AS titulo",
        "e.fechaEvento AS fechaEvento",
      ])
      .getRawMany();

    if (!eventos || eventos.length === 0) {
      return {
        message: "El usuario no tiene eventos suscritos",
        data: [],
      };
    }

    return {
      total: eventos.length,
      data: eventos,
    };
  }

  async obtenerEventosUsuario(idUsuario: string) {
    if (!idUsuario || idUsuario.trim() === "") {
      throw new AppError("ID de usuario inválido", 400);
    }

    const ahora = new Date();

    const proximos = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .innerJoin("eu.idEvento", "e")
      .innerJoin("eu.idCliente", "u")
      .where("u.idCliente = :idCliente", { idCliente: idUsuario })
      .andWhere("eu.estado = :estado", { estado: EstadoEventoUsuario.SUSCRITO })
      .andWhere("e.horaFin > SYSDATE")
      .select([
        "e.idEvento AS idEvento",
        "e.titulo AS titulo",
        "e.fechaEvento AS fechaEvento",
        "e.horaInicio AS horaInicio",
        "e.horaFin AS horaFin",
        "e.imagenUrl AS imgUrl",
        "eu.estado AS estado",
      ])
      .orderBy("e.horaInicio", "ASC")
      .getRawMany();

    const historial = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .innerJoin("eu.idEvento", "e")
      .innerJoin("eu.idCliente", "u")
      .where("u.idCliente = :idCliente", { idCliente: idUsuario })
      .andWhere(
        new Brackets((qb) => {
          qb.where("eu.estado IN (:...estados)", {
            estados: [
              EstadoEventoUsuario.ASISTIO,
              EstadoEventoUsuario.NO_ASISTIO,
              EstadoEventoUsuario.CANCELADO,
            ],
          }).orWhere("eu.estado = :suscrito AND e.horaFin <= SYSDATE", {
            suscrito: EstadoEventoUsuario.SUSCRITO,
          });
        }),
      )
      .select([
        "e.idEvento AS idEvento",
        "e.titulo AS titulo",
        "e.fechaEvento AS fechaEvento",
        "e.horaInicio AS horaInicio",
        "e.horaFin AS horaFin",
        "e.imagenUrl AS imgUrl",
        "eu.estado AS estado",
        "eu.asistio AS asistio",
      ])
      .orderBy("e.horaInicio", "DESC")
      .getRawMany();

    return {
      proximos: proximos.map((e) => ({
        ...this.mapToHistorialEventosXUsuarioDto(e),
        tiempoRestante: this.calcularTiempoRestante(new Date(e.HORAINICIO)),
      })),
      historial: historial.map((e) => ({
        ...this.mapToHistorialEventosXUsuarioDto(e),
        estadoTexto:
          e.ASISTIO === true
            ? "Asistió"
            : e.ESTADO === EstadoEventoUsuario.CANCELADO
              ? "Cancelado"
              : "No asistió",
      })),
    };
  }

  private calcularTiempoRestante = (fechaEvento: Date): string => {
    const ahora = new Date();
    const diffMs = fechaEvento.getTime() - ahora.getTime();

    if (diffMs <= 0) return "Ahora";

    // Comparar por fecha de calendario (sin hora)
    const hoyCalendario = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );
    const eventoCalendario = new Date(
      fechaEvento.getFullYear(),
      fechaEvento.getMonth(),
      fechaEvento.getDate(),
    );
    const diasCalendario = Math.round(
      (eventoCalendario.getTime() - hoyCalendario.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diasCalendario > 1) return `En ${diasCalendario} días`;
    if (diasCalendario === 1) return "Mañana";

    // Solo si es hoy, calcular horas/minutos
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor(diffMs / (1000 * 60));

    if (horas > 1) return `En ${horas} horas`;
    if (horas === 1) return "En 1 hora";
    if (minutos > 1) return `En ${minutos} minutos`;

    return "En breve";
  };
}
