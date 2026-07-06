import { SelectQueryBuilder } from "typeorm";
import { Eventos } from "./entity.js";

export function eventoNoFinalizado(): string {
  return `
    (
      e.fechaEvento +
      (
        TO_DATE(e.horaFin, 'HH24:MI')
        - TRUNC(TO_DATE(e.horaFin, 'HH24:MI'))
      )
    ) >= SYSDATE
  `;
}

export class EventosQueries {
  static baseEventosUsuario(
    qb: SelectQueryBuilder<Eventos>,
    idCliente: string,
  ): SelectQueryBuilder<Eventos> {
    return qb
      .leftJoin("e.idSalon", "s")
      .leftJoin("s.idLocal", "l")
      .leftJoin("l.idInstitucion", "i")
      .innerJoin("i.usuarioInstituciones", "ui")
      .leftJoin("e.idSubsalon", "ss")
      .leftJoin("e.eventosUsuarios", "eu", "eu.idCliente = :idCliente", { idCliente })
      .where("ui.idCliente = :idCliente", { idCliente })
      .select([
        "e.idEvento", "e.titulo", "e.descripcion",
        "e.fechaEvento", "e.horaInicio", "e.horaFin",
        "e.imagenUrl", "e.precio", "e.destacado",
        "e.ordenDestacado", "e.publicoEsperado",
        "e.tiempoSetupMin", "e.tiempoCleanMin",
        "e.fechaRegistro",
        "s.idSalon", "s.nombre",
        "l.idLocal", "l.nombre", "l.ubicacion", "l.descripcion",
        "i.idInstitucion", "i.nombre", "i.direccion", "i.ciudad",
        "ss.idSubsalon", "ss.nombre",
        // qrToken debe estar aquí — mapToEventoListDto lo necesita
        "eu.idEventoUsuario", "eu.fechaRegistro", "eu.qrToken",
      ]);
  }

  static proximos(qb: SelectQueryBuilder<Eventos>): SelectQueryBuilder<Eventos> {
    return qb
      .andWhere(eventoNoFinalizado())
      .orderBy("e.fechaEvento", "ASC")
      .addOrderBy("e.horaInicio", "ASC");
  }

  static destacados(qb: SelectQueryBuilder<Eventos>): SelectQueryBuilder<Eventos> {
    return qb
      .andWhere("e.destacado = 1")
      .andWhere(eventoNoFinalizado())
      .orderBy("e.ordenDestacado", "ASC");
  }

  static populares(qb: SelectQueryBuilder<Eventos>): SelectQueryBuilder<Eventos> {
    return qb
      .andWhere(eventoNoFinalizado())
      .orderBy("e.publicoEsperado", "DESC");
  }
}