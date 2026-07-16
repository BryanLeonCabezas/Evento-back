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
import { eventoUsuarioRepository } from "./repository.js";
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
import { sendCompraEmail } from "../../services/external/correo.js";
import {
  generarDevReference,
  procesarPagoInstitucion,
} from "../../common/utils/dev_reference.utils.js";
import { ProcesoPagoInstitucionDto } from "../pagos/dto/procesoPagoInstitucion.dto.js";

export class EventoUsuarioService {
  private readonly eventoUsuarioRepository = eventoUsuarioRepository;
  private readonly pagosService = new PagosService();

  //private paymentezProvider = new PaymentezProvider();

  private mapToHistorialEventosXUsuarioDto(
    evento: any,
  ): HistorialEventosXUsuarioDto {
    return {
      idEvento: evento.IDEVENTO,
      titulo: evento.TITULO,
      fechaEvento: formatLocalDate(evento.FECHAEVENTO),
      horaInicio: evento.HORAINICIO,
      horaFin: evento.HORAFIN,
      estado: evento.ESTADO as EstadoEventoUsuario,
      imgUrl: evento.IMGURL,
      precio: evento.PRECIO,
    };
  }

  private resolverEstadoTexto(estado: string): string {
    switch (estado) {
      case EstadoEventoUsuario.ASISTIO:
        return "Asistió";
      case EstadoEventoUsuario.NO_ASISTIO:
        return "No asistió";
      case EstadoEventoUsuario.CANCELADO:
        return "Cancelado";
      default:
        return "Sin confirmar";
    }
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

  async suscribirUsuario(
    idEvento: number,
    idUsuario: string,
    estado: EstadoEventoUsuario = EstadoEventoUsuario.SUSCRITO,
    observacion?: string,
    idTarjeta?: number,
  ) {
    const resultado = await this.eventoUsuarioRepository.manager.transaction(
      async (manager: any) => {
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

        let payload: ProcesoPagoInstitucionDto | undefined = undefined;
        if (!evento) throw new AppError("Evento no encontrado", 404);
        if (usuarioInscrito)
          throw new AppError("El usuario ya está suscrito a este evento", 400);
        if (inscritosAlEvento.INSCRITOS >= publicoEsperado.PUBLICO_ESPERADO)
          throw new AppError("El evento ha alcanzado su capacidad máxima", 400);
        if (
          usuario.NUMERO_ID === null ||
          usuario.NUMERO_ID === undefined ||
          usuario.NUMERO_ID === ""
        ) {
          throw new AppError(
            "El usuario no tiene un número de identificación válido",
            400,
          );
        }
        if (
          usuario.TIPO_ID === null ||
          usuario.TIPO_ID === undefined ||
          usuario.TIPO_ID === ""
        ) {
          throw new AppError(
            "El usuario no tiene un tipo de identificación válido",
            400,
          );
        }
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
            origen: "DEBITO",
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

          const urlCodPago = institucion.URL_COD_PAGO;
          const urlProcesoPago = institucion.URL_PROCESO_PAGO;

          const devReference = await generarDevReference(
            idEvento,
            usuario.NUMERO_ID,
            urlCodPago,
            {
              idUsuario,
              nombres: usuario.NOMBRE + " " + usuario.APELLIDO,
              valorFinal: precioEvento,
              itemPago: evento.TITULO,
              codItem: evento.COD_ITEM,
            },
          );

          const responsePago = await paymentsService.debitar({
            userId: idUsuario,
            cardToken: tarjetaUsuario.TOKEN,
            amount: precioEvento,
            description: `Pago por inscripción al evento ${evento.TITULO}`,
            email: usuario.EMAIL,
            devReference: devReference.toString(),
          });

          transaccion = responsePago?.transaction;
          pagoNormalizado = mapper.mapDebito(responsePago, "DEBITO");

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

          payload = {
            codPago: devReference,
            respuesta: Number(pagoNormalizado.statusDetail),
            descripcionRespuesta: pagoNormalizado.status?.toString() ?? null,
            idTransaccion: pagoNormalizado.transaccionId,
            fecha: new Date(),

            nombreFactura: `${usuario.NOMBRE} ${usuario.APELLIDO}`,
            emailFactura: usuario.EMAIL,
            tipoIdFactura: usuario.TIPO_ID,
            idFactura: usuario.NUMERO_ID,

            incluyeIva: evento.INCLUYE_IVA,

            iva: Number(evento.MONTO_IVA ?? 0),
            valorPago: Number(precioEvento),
            valorDescuento: 0,
            codItem: evento.COD_ITEM,
          };
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
            extra: {
              correo: usuario.EMAIL,
              nombre: usuario.NOMBRE,
              evento: evento.TITULO,
              monto: precioEvento,
              transaccionId: transaccion?.id ?? null,
              payload: payload,
              urlProcesoPago: institucion.URL_PROCESO_PAGO,
            },
          };
        } catch (error) {
          // ── CASO 4: Pago OK pero falló la BD → reembolsar y registrar ──────
          if (precioEvento > 0 && transaccion?.id && paymentsService) {
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
                  "DEBITO",
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

    //ejecutar proceso de institucion:
    const urlProcesoPago = resultado.extra.urlProcesoPago;

    console.log("urlProcesoPago", urlProcesoPago);
    console.log("resultado.extra.payload", resultado.extra);
    try {
      if (urlProcesoPago && resultado.extra.payload) {
        await procesarPagoInstitucion(urlProcesoPago, resultado.extra.payload);
      }
    } catch (e) {
      console.error("Error notificando pago a la institución:", e);
    }
    try {
      sendCompraEmail({
        correo: resultado.extra.correo,
        nombre: resultado.extra.nombre,
        evento: resultado.extra.evento,
        estado: resultado.extra.monto === 0 ? "GRATUITO" : "PAGADO",
        monto:
          resultado.extra.monto === 0 ? "$0.00" : `$${resultado.extra.monto}`,
        transaccionId: resultado.extra.transaccionId,
      }).catch(() => {}); // no romper flujo
    } catch (e) {
      console.error("Error enviando correo:", e);
    }

    // 🔹 3. Devuelves respuesta limpia
    return {
      message: resultado.message,
      data: resultado.data,
      success: resultado.success,
    };
  }

  async eliminarSuscripcion(idEvento: number, idUsuario: string) {
    const result = await this.eventoUsuarioRepository.manager
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
    const usuarios = await this.eventoUsuarioRepository
      .createQueryBuilder("eu")
      .innerJoin("eu.idCliente", "u")
      .innerJoin("eu.idEvento", "e")
      .where("e.idEvento = :idEvento", { idEvento })
      .andWhere("eu.estado = :estado", { estado: EstadoEventoUsuario.SUSCRITO })
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

    const eventos = await this.eventoUsuarioRepository
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
    if (!idUsuario?.trim()) {
      throw new AppError("ID de usuario inválido", 400);
    }

    const baseQuery = () =>
      this.eventoUsuarioRepository
        .createQueryBuilder("eu")
        .innerJoin("eu.idEvento", "e")
        .innerJoin("eu.idCliente", "u")
        .where("u.idCliente = :idCliente", { idCliente: idUsuario })
        .select([
          "e.idEvento       AS idEvento",
          "e.titulo         AS titulo",
          "e.fechaEvento    AS fechaEvento",
          "e.horaInicio     AS horaInicio",
          "e.horaFin        AS horaFin",
          "e.imagenUrl      AS imgUrl",
          "e.precio         AS precio",
          "eu.estado        AS estado",
          "eu.asistio       AS asistio",
          "eu.fechaEntrada  AS fechaEntrada",
        ]);

    const [proximosRaw, historialRaw] = await Promise.all([
      baseQuery()
        .andWhere("eu.estado = :estado", {
          estado: EstadoEventoUsuario.SUSCRITO,
        })
        .andWhere(
          `
            TO_DATE(
              TO_CHAR(e.fechaEvento, 'YYYY-MM-DD') || ' ' || e.horaFin,
              'YYYY-MM-DD HH24:MI'
            ) > SYSDATE
          `,
        )
        .orderBy("e.horaInicio", "ASC")
        .getRawMany(),

      baseQuery()
        .andWhere(
          new Brackets((qb) => {
            qb.where("eu.estado IN (:...estados)", {
              estados: [
                EstadoEventoUsuario.ASISTIO,
                EstadoEventoUsuario.NO_ASISTIO,
                EstadoEventoUsuario.CANCELADO,
              ],
            }).orWhere(
              `
                eu.estado = :suscrito
                AND TO_DATE(
                  TO_CHAR(e.fechaEvento, 'YYYY-MM-DD') || ' ' || e.horaFin,
                  'YYYY-MM-DD HH24:MI'
                ) <= SYSDATE
              `,
              {
                suscrito: EstadoEventoUsuario.SUSCRITO,
              },
            );
          }),
        )
        .orderBy("e.horaInicio", "DESC")
        .getRawMany(),
    ]);

    return {
      proximos: proximosRaw.map((e: any) => ({
        ...this.mapToHistorialEventosXUsuarioDto(e),
        tiempoRestante: this.calcularTiempoRestante(new Date(e.HORAINICIO)),
      })),
      historial: historialRaw.map((e: any) => ({
        ...this.mapToHistorialEventosXUsuarioDto(e),
        estadoTexto: this.resolverEstadoTexto(e.ESTADO),
      })),
    };
  }

  // ── CHECKOUT: Paso 1 — crear reference ────────────────────────────────
  async initCheckout(idEvento: number, idUsuario: string) {
    const manager = this.eventoUsuarioRepository.manager;

    const [
      evento,
      institucion,
      usuario,
      usuarioInscrito,
      inscritosAlEvento,
      publicoEsperado,
    ] = await Promise.all([
      obtenerEvento(manager, idEvento),
      obtenerDatosInstitucion(manager, idEvento),
      obtenerUsuario(manager, idUsuario),
      usuarioYaInscrito(manager, idEvento, idUsuario),
      contarInscritos(manager, idEvento),
      obtenerPublicoEsperado(manager, idEvento),
    ]);

    if (!evento) throw new AppError("Evento no encontrado", 404);
    if (usuarioInscrito)
      throw new AppError("El usuario ya está suscrito a este evento", 400);
    if (Number(evento.PRECIO) === 0)
      throw new AppError("El evento es gratuito, usa el flujo normal", 400);
    if (inscritosAlEvento.INSCRITOS >= publicoEsperado.PUBLICO_ESPERADO)
      throw new AppError("El evento ha alcanzado su capacidad máxima", 400);
    if (
      usuario.NUMERO_ID === null ||
      usuario.NUMERO_ID === undefined ||
      usuario.NUMERO_ID === ""
    ) {
      throw new AppError(
        "El usuario no tiene un número de identificación válido",
        400,
      );
    }
    if (
      usuario.TIPO_ID === null ||
      usuario.TIPO_ID === undefined ||
      usuario.TIPO_ID === ""
    ) {
      throw new AppError(
        "El usuario no tiene un tipo de identificación válido",
        400,
      );
    }

    const urlCodPago = institucion.URL_COD_PAGO;
    const urlProcesoPago = institucion.URL_PROCESO_PAGO;

    const devReference = await generarDevReference(
      idEvento,
      usuario.NUMERO_ID,
      urlCodPago,
      {
        idUsuario,
        nombres: usuario.NOMBRE + " " + usuario.APELLIDO,
        valorFinal: Number(evento.PRECIO),
        itemPago: evento.TITULO,
        codItem: evento.COD_ITEM,
      },
    );
    console.log(devReference);
    const provider = PaymentProviderFactory.create(institucion);
    const paymentsService = new PaymentsService(provider);

    const result = await paymentsService.initReference({
      locale: "es",
      userId: idUsuario,
      userEmail: usuario.EMAIL,
      amount: Number(evento.PRECIO),
      description: `Inscripción: ${evento.TITULO}`,
      devReference: devReference.toString(),
      vat: 0,
      tax_percentage: 0,
      taxable_amount: 0,
      installmentsType: 0,
    });

    const result2 = await this.pagosService.registrarEnTransaccion(manager, {
      normalizado: {
        tipo: "PENDIENTE",
        estado: "PENDIENTE",
        detalleEstado: "Checkout iniciado",
        monto: Number(evento.PRECIO),
        moneda: "USD",
        transaccionId: null,
        pasarela: "paymentez",
        metodoPago: null,
        marcaTarjeta: null,
        ultimos4: null,
        responseJson: result,
        origen: "CHECKOUT",
      },
      idEvento,
      idCliente: idUsuario,
      eventoUsuario: null,
      devReference,
    });

    return {
      reference: result.reference,
      envMode: institucion.PAYMENT_ENVIROMENT ?? "stg",
      urlCheckout: result.checkout_url,
    };
  }

  // ── CHECKOUT: Paso 2 — confirmar con transactionId ────────────────────
  async confirmarCheckout(
    idEvento: number,
    idUsuario: string,
    transactionId: string,
    checkoutResponse: any, // el objeto completo del widget
  ) {
    const resultado = await this.eventoUsuarioRepository.manager.transaction(
      async (manager: any) => {
        const [
          evento,
          institucion,
          usuario,
          usuarioInscrito,
          inscritos,
          publico,
        ] = await Promise.all([
          obtenerEvento(manager, idEvento),
          obtenerDatosInstitucion(manager, idEvento),
          obtenerUsuario(manager, idUsuario),
          usuarioYaInscrito(manager, idEvento, idUsuario),
          contarInscritos(manager, idEvento),
          obtenerPublicoEsperado(manager, idEvento),
        ]);

        if (!evento) throw new AppError("Evento no encontrado", 404);
        if (usuarioInscrito)
          throw new AppError("El usuario ya está suscrito a este evento", 400);
        if (inscritos.INSCRITOS >= publico.PUBLICO_ESPERADO)
          throw new AppError("Capacidad máxima alcanzada", 400);

        // Verificar dev_reference para que nadie pueda reutilizar una transacción ajena
        //const devReferenceEsperado = generarDevReference(idEvento, idUsuario);
        const devReferenceRecibido =
          checkoutResponse?.transaction?.dev_reference;

        const pago =
          await this.pagosService.obtenerPagoXReferencia(devReferenceRecibido);

        if (!pago) {
          throw new AppError("Referencia inválida", 400);
        }

        if (pago.idEvento !== idEvento || pago.idCliente !== idUsuario) {
          throw new AppError("No corresponde", 400);
        }

        // Verificar monto
        const montoRecibido = Number(checkoutResponse?.transaction?.amount);
        if (montoRecibido !== Number(evento.PRECIO)) {
          throw new AppError("El monto de la transacción no coincide", 400);
        }

        // Mapear igual que débito — misma estructura de response
        const nombrePasarela = institucion.PROVEEDOR_PAGO ?? "paymentez";
        const mapper = GatewayMapperFactory.create(nombrePasarela);
        const pagoNormalizado = mapper.mapDebito(checkoutResponse, "CHECKOUT"); // reutilizas mapDebito

        if (pagoNormalizado.tipo === "FALLIDO") {
          throw new AppError("La transacción no fue aprobada", 400);
        }

        const nuevoRegistro = manager.create(EventosUsuarios, {
          idEvento: { idEvento },
          idCliente: { idCliente: idUsuario },
          estado: EstadoEventoUsuario.SUSCRITO,
          qrToken: generarCodigoQR("TCK"),
        });

        const eventoUsuarioGuardado = await manager.save(nuevoRegistro);

        await this.pagosService.actualizarPago(
          manager,
          pago,
          pagoNormalizado,
          eventoUsuarioGuardado,
        );

        const payload: ProcesoPagoInstitucionDto = {
          codPago: devReferenceRecibido,
          respuesta: Number(pagoNormalizado.statusDetail),
          descripcionRespuesta: pagoNormalizado.status?.toString() ?? null,
          idTransaccion: pagoNormalizado.transaccionId,
          fecha: new Date(),
          nombreFactura: usuario.NOMBRE + " " + usuario.APELLIDO,
          emailFactura: usuario.EMAIL,
          tipoIdFactura: usuario.TIPO_ID,
          idFactura: usuario.NUMERO_ID,
          iva: evento.MONTO_IVA ?? 0,
          valorPago: Number(pago.monto),
          valorDescuento: 0,
          codItem: evento.COD_ITEM,
          incluyeIva: evento.INCLUYE_IVA,
        };

        await procesarPagoInstitucion(institucion.URL_PROCESO_PAGO, payload);

        return {
          message: "Pago realizado e inscripción confirmada",
          data: {
            idEvento,
            nombreEvento: evento.TITULO,
            transaccionId: transactionId,
          },
          success: true,
          extra: {
            correo: usuario.EMAIL,
            nombre: usuario.NOMBRE,
            evento: evento.TITULO,
            monto: Number(evento.PRECIO),
            transaccionId: transactionId,
            payload: payload,
            urlProcesoPago: institucion.URL_PROCESO_PAGO,
          },
        };
      },
    );

    const urlProcesoPago = resultado.extra.urlProcesoPago;

    try {
      if (urlProcesoPago && resultado.extra.payload) {
        await procesarPagoInstitucion(urlProcesoPago, resultado.extra.payload);
      }
    } catch (e) {
      console.error("Error notificando pago a la institución:", e);
    }

    // Correo fuera de la transacción — igual que suscribirUsuario

    try {
      sendCompraEmail({
        correo: resultado.extra.correo,
        nombre: resultado.extra.nombre,
        evento: resultado.extra.evento,
        estado: "PAGADO",
        monto: `$${resultado.extra.monto}`,
        transaccionId: resultado.extra.transaccionId,
      }).catch(() => {});
    } catch (e) {
      console.error("Error enviando correo:", e);
    }

    return {
      message: resultado.message,
      data: resultado.data,
      success: resultado.success,
    };
  }
}
