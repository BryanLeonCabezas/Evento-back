import { email, success } from "zod";
import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { PaymentezProvider } from "../payments/providers/paymentez.js";
import {
  contarInscritos,
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

export class EventoUsuarioService {
  private eventoUsuarioReposiroty = eventoUsuarioReposiroty;
  private paymentezProvider = new PaymentezProvider();

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

  @Transactional()
  async suscribirUsuario(
    idEvento: number,
    idUsuario: string,
    estado: EstadoEventoUsuario = EstadoEventoUsuario.SUSCRITO,
    observacion?: string,
    idTarjeta?: number,
  ) {
    console.log("ID Evento:", idEvento);
    console.log("ID Usuario:", idUsuario);
    console.log("Observación:", observacion);
    console.log("ID Tarjeta:", idTarjeta);
    const [
      evento,
      precioEvento,
      publicoEsperado,
      inscritosAlEvento,
      tarjetaUsuario,
      usuario,
      usuarioInscrito,
    ] = await Promise.all([
      obtenerEvento(this.eventoUsuarioReposiroty, idEvento),
      obtenerPrecioEvento(this.eventoUsuarioReposiroty, idEvento),
      obtenerPublicoEsperado(this.eventoUsuarioReposiroty, idEvento),
      contarInscritos(this.eventoUsuarioReposiroty, idEvento),
      obtenerTarjetaUsuario(this.eventoUsuarioReposiroty, idTarjeta, idUsuario),
      obtenerUsuario(this.eventoUsuarioReposiroty, idUsuario),
      usuarioYaInscrito(this.eventoUsuarioReposiroty, idEvento, idUsuario),
    ]);
    let transaccion: any = null;
    console.log("Usuario encontrado:", usuario);
    if (!evento) {
      throw new AppError("Evento no encontrado", 404);
    }
    console.log("Evento encontrado:", precioEvento);
    console.log("Precio del evento:", precioEvento);
    console.log("Público esperado para el evento:", publicoEsperado);
    console.log("Número de inscritos al evento:", inscritosAlEvento);
    console.log("Tarjeta del usuario para el evento:", tarjetaUsuario);
    console.log("¿El usuario ya está inscrito en el evento?", usuarioInscrito);

    if (usuarioInscrito) {
      throw new AppError("El usuario ya está suscrito a este evento", 400);
    }
    if (
      precioEvento.PRECIO > 0 &&
      (!tarjetaUsuario || Object.keys(tarjetaUsuario).length === 0)
    ) {
      throw new AppError("El evento requiere un método de pago válido", 400);
    }

    if (inscritosAlEvento.INSCRITOS >= publicoEsperado.PUBLICO_ESPERADO) {
      throw new AppError("El evento ha alcanzado su capacidad máxima", 400);
    }

    if (precioEvento.PRECIO > 0) {
      const dataDebit = {
        userId: idUsuario,
        cardToken: tarjetaUsuario.TOKEN,
        amount: precioEvento.PRECIO,
        description: `Pago por inscripción al evento ${evento.TITULO}`,
        email: usuario.EMAIL,
      };

      console.log("Datos para el débito:", dataDebit);

      const responsePago = await this.paymentezProvider.debit(dataDebit);

      transaccion = responsePago?.transaction;

      console.log("Respuesta de Paymentez:", responsePago);
      if (!transaccion || transaccion.status_detail !== 3) {
        throw new AppError(
          "No se pudo procesar el pago. Verifica tu método de pago.",
          400,
        );
      }
    }

    const nuevoRegistro = this.eventoUsuarioReposiroty.create({
      idEvento: { idEvento },
      idCliente: { idCliente: idUsuario },
      estado: EstadoEventoUsuario.SUSCRITO,
      observacion,
      qrToken: generarCodigoQR("TCK"),
    });

    const transaccionId = transaccion?.id ?? null;

    const response = {
      message:
        precioEvento.PRECIO > 0
          ? "Pago realizado e inscripción confirmada"
          : "Inscripción confirmada (evento gratuito)",
      data: {
        idEvento,
        nombreEvento: evento.TITULO,
        transaccionId,
      },
      success: true,
    };

    await this.eventoUsuarioReposiroty.save(nuevoRegistro);

    return response;
  }

  async eliminarSuscripcion(idEvento: number, idUsuario: string) {
    const result = await this.eventoUsuarioReposiroty
      .createQueryBuilder()
      .update("EVENTOS_USUARIOS")
      .set({
        estado: "I",
        observacion: "Usuario se desuscribió",
      })
      .where("ID_CLIENTE = :idCliente", { idCliente: idUsuario })
      .andWhere("ID_EVENTO = :idEvento", { idEvento })
      .andWhere("ESTADO = 'A'")
      .execute();

    if (result.affected === 0) {
      throw new AppError("El usuario no esta suscripto al evento", 400);
    }

    return {
      message: "Usuario desuscripto correctamente",
    };
  }

  async obtenerUsuariosSuscritosXEvento(idEvento: number) {
    if (!idEvento || idEvento <= 0) {
      throw new AppError("ID de evento inválido", 400);
    }
    console.log("idEvento", idEvento);
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

    if (!usuarios || usuarios.length === 0) {
      return {
        message: "No existen usuarios suscritos a este evento",
        data: [],
      };
    }

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

    const eventos = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .innerJoin("eu.idEvento", "e")
      .innerJoin("eu.idCliente", "u")
      .where("u.idCliente = :idCliente", { idCliente: idUsuario })
      .andWhere("eu.estado IN (:...estados)", {
        estados: [
          EstadoEventoUsuario.SUSCRITO,
          EstadoEventoUsuario.ASISTIO,
          EstadoEventoUsuario.NO_ASISTIO,
        ],
      })
      .select([
        "e.idEvento AS idEvento",
        "e.titulo AS titulo",
        "e.fechaEvento AS fechaEvento",
        "e.horaInicio AS horaInicio",
        "e.imagenUrl AS imgUrl",
        "e.horaFin AS horaFin",
        "eu.estado AS estado",
        "eu.asistio AS asistio",
        "eu.fechaEntrada AS fechaEntrada",
      ])
      .orderBy("e.fechaEvento", "ASC")
      .getRawMany();
    console.log("Eventos obtenidos para el usuario:", eventos);

    const ahora = new Date();
    console.log("ISO:", ahora.toISOString());
    console.log("Local:", ahora.toString());
    console.log("Locale:", ahora.toLocaleString());
    console.log("Fecha y hora actual:", ahora);

    const proximos: any[] = [];
    const historial: any[] = [];

    for (const evento of eventos) {
      const inicioEvento = new Date(evento.HORAINICIO);
      console.log(inicioEvento);
      if (
        inicioEvento >= ahora &&
        evento.ESTADO === EstadoEventoUsuario.SUSCRITO
      ) {
        const tiempoRestante = this.calcularTiempoRestante(inicioEvento);
        console.log("Tiempo restante para el evento:", tiempoRestante);
        proximos.push({
          ...this.mapToHistorialEventosXUsuarioDto(evento),
          tiempoRestante,
        });
      } else {
        let estadoTexto = "Cancelado";

        if (evento.ASISTIO === "S") {
          estadoTexto = "Asistió";
        } else if (evento.ESTADO === EstadoEventoUsuario.NO_ASISTIO) {
          estadoTexto = "No asistió";
        }

        historial.push({
          ...this.mapToHistorialEventosXUsuarioDto(evento),
          estadoTexto,
        });
      }
    }

    return {
      proximos,
      historial,
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
