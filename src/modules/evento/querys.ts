// eventos.queries.ts
import { SelectQueryBuilder } from "typeorm";
import { Eventos } from "./entity.js";

export class EventosQueries {
  static baseEventosUsuario(
    qb: SelectQueryBuilder<Eventos>,
    idCliente: string,
  ) {

    const query = qb
      .leftJoin("e.idSalon", "s")
      .leftJoin("s.idLocal", "l")
      .leftJoin("l.idInstitucion", "i")
      .innerJoin("i.usuarioInstituciones", "ui")
      .leftJoin("e.idSubsalon", "ss")
      .where("ui.idCliente = :idCliente", { idCliente })
      .select([
        // EVENTO
        "e.idEvento",
        "e.titulo",
        "e.descripcion",
        "e.fechaEvento",
        "e.horaInicio",
        "e.horaFin",
        "e.imagenUrl",
        "e.precio",
        "e.destacado",
        "e.ordenDestacado",
        "e.publicoEsperado",
        "e.tiempoSetupMin",
        "e.tiempoCleanMin",
        "e.fechaRegistro",

        // SALON
        "s.idSalon",
        "s.nombre",

        // LOCAL
        "l.idLocal",
        "l.nombre",
        "l.ubicacion",
        "l.descripcion",

        // INSTITUCION
        "i.idInstitucion",
        "i.nombre",
        "i.direccion",
        "i.ciudad",

        // SUBSALON
        "ss.idSubsalon",
        "ss.nombre",
      ]);

    query
      .leftJoin("e.eventosUsuarios", "eu", "eu.idCliente = :idCliente", {
        idCliente,
      })
      .addSelect(["eu.idEventoUsuario", "eu.fechaRegistro"]);

      return query;
  }

  static proximos(qb: SelectQueryBuilder<Eventos>) {
    return qb
      .andWhere("e.fechaEvento >= CURRENT_DATE")
      .orderBy("e.fechaEvento", "ASC");
  }

  static destacados(qb: SelectQueryBuilder<Eventos>) {
    return qb.andWhere("e.destacado = 1").orderBy("e.ordenDestacado", "ASC");
  }

  static populares(qb: SelectQueryBuilder<Eventos>) {
    return qb.orderBy("e.publicoEsperado", "DESC");
  }
}
