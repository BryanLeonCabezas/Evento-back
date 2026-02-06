import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { eventoUsuarioReposiroty } from "./repository.js";

export class EventoUsuarioService {
  private eventoUsuarioReposiroty = eventoUsuarioReposiroty;

  async suscribirUsuario(
    idEvento: number,
    idUsuario: string,
    estado: EstadoEventoUsuario = EstadoEventoUsuario.ACTIVO,
    observacion?: string,
  ) {
    // Intentar reactivar si existe inactivo
    const reactivado = await this.eventoUsuarioReposiroty
      .createQueryBuilder()
      .update("EVENTOS_USUARIOS")
      .set({
        estado,
        observacion: observacion ?? null,
      })
      .where("ID_CLIENTE = :idCliente", { idCliente: idUsuario })
      .andWhere("ID_EVENTO = :idEvento", { idEvento })
      .andWhere("ESTADO = 'I'")
      .execute();

    if (reactivado.affected && reactivado.affected > 0) {
      return {
        message: "Usuario re-suscrito correctamente",
      };
    }

    // Verificar si ya está activo
    const existeActivo = await this.eventoUsuarioReposiroty
      .createQueryBuilder("eu")
      .where("eu.ID_CLIENTE = :idCliente", { idCliente: idUsuario })
      .andWhere("eu.ID_EVENTO = :idEvento", { idEvento })
      .andWhere("eu.ESTADO = 'A'")
      .getExists();

    if (existeActivo) {
      throw new AppError("El usuario ya esta suscripto al evento", 400);
    }

    const nuevo = this.eventoUsuarioReposiroty.create({
      idEvento: { idEvento },
      idCliente: { idCliente: idUsuario },
      estado,
      observacion: observacion ?? null,
    });

    await this.eventoUsuarioReposiroty.save(nuevo);

    return {
      message: "Usuario suscrito correctamente",
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
    .getRawMany(); // 👈 CLAVE

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
}
