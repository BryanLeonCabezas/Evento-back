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

export class EventoUsuarioService {
  private eventoUsuarioReposiroty = eventoUsuarioReposiroty;
  private paymentezProvider = new PaymentezProvider();
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
    const dataDebit = {
      userId: idUsuario,
      cardToken: tarjetaUsuario.TOKEN,
      amount: precioEvento.PRECIO,
      description: `Pago por inscripción al evento ${evento.TITULO}`,
      email: usuario.EMAIL,
    };

    console.log("Datos para el débito:", dataDebit);

    const response = await this.paymentezProvider.debit(dataDebit);

    const transaccion = response?.transaction;

    console.log("Respuesta de Paymentez:", response);
    if (!transaccion || transaccion.status_detail !== 3) {
      console.log("Error en la transacción:", response);

      throw new AppError(
        "No se pudo procesar el pago. Por favor, verifica tu método de pago o intenta nuevamente.",
        400,
      );
    }

    const nuevoRegistro = this.eventoUsuarioReposiroty.create({
      idEvento: { idEvento },
      idCliente: { idCliente: idUsuario },
      estado: EstadoEventoUsuario.SUSCRITO,
      observacion,
    });

    await this.eventoUsuarioReposiroty.save(nuevoRegistro);

    return {
      message: "Usuario suscrito correctamente",
      data:{
        idEvento,
        nombreEvento: evento.TITULO,
        transaccionId: transaccion.id,
      },
      success: true,
    };
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
        "e.horaFin AS horaFin",
        "eu.estado AS estado",
      ])
      .orderBy("e.fechaEvento", "ASC")
      .getRawMany();

    const hoy = new Date();

    const proximos: any[] = [];
    const historial: any[] = [];

    for (const evento of eventos) {
      const fechaEvento = new Date(evento.fechaEvento);

      if (
        fechaEvento >= hoy &&
        evento.estado === EstadoEventoUsuario.SUSCRITO
      ) {
        proximos.push(evento);
      } else {
        historial.push({
          ...evento,
          estadoTexto:
            evento.estado === EstadoEventoUsuario.ASISTIO
              ? "Asistió"
              : evento.estado === EstadoEventoUsuario.NO_ASISTIO
                ? "No asistió"
                : "Cancelado",
        });
      }

      return {
        proximos,
        historial,
      };
    }
  }
}
