import { id } from "zod/locales";
import { EventoListDto } from "./dto/evento-list.js";
import { eventoRepository } from "./repository.js";
import { usuarioInstitucionesReposiroty } from "../usuarioIntituciones/repository.js";
import { institucionRepository } from "../instituciones/repository.js";
import { EventosPorInstitucionDto } from "./dto/eventoPorInstitucion.js";
import { EventosQueries } from "./querys.js";
import { log } from "node:console";
import {
  formatLocalDate,
  formatTime,
} from "../../common/utils/ValidateRoutes.util.js";

export class EventoService {
  private eventoRepository = eventoRepository;
  private institucionRepository = institucionRepository;

  private mapToEventoListDto(evento: any): EventoListDto {
    return {
      idEvento: evento.idEvento,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaEvento: formatLocalDate(evento.fechaEvento),
      horaInicio: formatTime(evento.horaInicio),
      horaFin: formatTime(evento.horaFin),
      imagenUrl: evento.imagenUrl,
      precio: evento.precio,
      destacado: evento.destacado,
      ordenDestacado: evento.ordenDestacado,
      publicoEsperado: evento.publicoEsperado,
      tiempoSetupMin: evento.tiempoSetupMin,
      tiempoCleanMin: evento.tiempoCleanMin,
      fechaRegistro: formatLocalDate(evento.fechaRegistro),

      salon: {
        idSalon: evento.idSalon.idSalon,
        nombre: evento.idSalon.nombre,
      },

      subsalon: evento.idSubsalon
        ? {
            idSubsalon: evento.idSubsalon.idSubsalon,
            nombre: evento.idSubsalon.nombre,
          }
        : null,
      local: {
        nombre: evento.idSalon.idLocal.nombre,
        ubicacion: evento.idSalon.idLocal.ubicacion,
        descripcion: evento.idSalon.idLocal.descripcion,
      },
      adquirido: !!evento.eventosUsuarios?.length,
      fechaCompra: evento.eventosUsuarios?.[0]?.fechaRegistro,
      QR: evento.eventosUsuarios?.[0]?.qrToken,
      estaActivo: evento?.estaActivo,
    };
  }

  async getEventosByUsuario(page = 1, limit = 10, idCliente: string) {
    const qb = this.eventoRepository
      .createQueryBuilder("e")
      .leftJoin("e.idSalon", "s")
      .leftJoin("s.idLocal", "l")
      .leftJoin("l.idInstitucion", "i")
      .innerJoin("i.usuarioInstituciones", "ui")
      .leftJoin("e.idSubsalon", "ss")
      .where("ui.idCliente = :idCliente", { idCliente })
      .select([
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

        "s.idSalon",
        "s.nombre",

        "l.idLocal",
        "l.nombre",
        "l.ubicacion",
        "l.descripcion",

        "i.idInstitucion",
        "i.nombre",
        "i.direccion",
        "i.ciudad",

        "ss.idSubsalon",
        "ss.nombre",
      ])
      .orderBy("e.destacado", "DESC")
      .addOrderBy("e.ordenDestacado", "ASC")
      .addOrderBy("e.fechaEvento", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const agrupado = data.reduce(
      (acc, evento) => {
        const institucion = evento.idSalon?.idLocal?.idInstitucion;
        if (!institucion) return acc;

        const id = institucion.idInstitucion;
        if (!acc[id]) {
          acc[id] = {
            institucion: {
              idInstitucion: institucion.idInstitucion,
              nombre: institucion.nombre,
              direccion: institucion.direccion ?? null,
              ciudad: institucion.ciudad ?? null,
              eventos: [],
            },
          } as EventosPorInstitucionDto;
        }

        acc[id].institucion.eventos.push(this.mapToEventoListDto(evento));

        return acc;
      },
      {} as Record<number, any>,
    );

    return {
      data: Object.values(agrupado),
    };
  }

  async getHomeEventos(idCliente: string) {
    const proximosQb = this.eventoRepository.createQueryBuilder("e");
    const proximos = await EventosQueries.proximos(
      EventosQueries.baseEventosUsuario(proximosQb, idCliente),
    )
      .take(5)
      .getMany();
    console.log("Próximos eventos:", proximos);
    const destacadosQb = this.eventoRepository.createQueryBuilder("e");
    const destacados = await EventosQueries.destacados(
      EventosQueries.baseEventosUsuario(destacadosQb, idCliente),
    )
      .take(5)
      .getMany();

    console.log("Destacados eventos:", destacados);

    const institucionQb = this.eventoRepository.createQueryBuilder("e");
    const eventosInstitucion = await EventosQueries.baseEventosUsuario(
      institucionQb,
      idCliente,
    )
      .andWhere("e.horaFin > SYSDATE")
      .orderBy("i.idInstitucion", "ASC")
      .addOrderBy("e.fechaEvento", "ASC")
      .getMany();

    console.log("Eventos por institución:", eventosInstitucion);

    const agrupado = eventosInstitucion.reduce(
      (acc, evento) => {
        const institucion = evento.idSalon?.idLocal?.idInstitucion;
        if (!institucion) return acc;

        const id = institucion.idInstitucion;

        if (!acc[id]) {
          acc[id] = {
            institucion: {
              idInstitucion: institucion.idInstitucion,
              nombre: institucion.nombre,
              direccion: institucion.direccion ?? null,
              ciudad: institucion.ciudad ?? null,
              eventos: [],
            },
          };
        }

        acc[id].institucion.eventos.push(this.mapToEventoListDto(evento));

        return acc;
      },
      {} as Record<number, any>,
    );

    return {
      proximos: proximos.map((e) => this.mapToEventoListDto(e)),
      destacados: destacados.map((e) => this.mapToEventoListDto(e)),
      porInstitucion: Object.values(agrupado),
    };
  }

  async getEventoById(id: number, idCliente?: string) {
    const qb = this.eventoRepository
      .createQueryBuilder("e")
      .leftJoinAndSelect("e.idSalon", "s")
      .leftJoinAndSelect("s.idLocal", "l")
      .leftJoinAndSelect("l.idInstitucion", "i")
      .leftJoinAndSelect("e.idSubsalon", "ss");

    if (idCliente) {
      qb.leftJoinAndSelect(
        "e.eventosUsuarios",
        "eu",
        "eu.idCliente = :idCliente",
        { idCliente },
      );
    }

    qb.where("e.idEvento = :id", { id });

    const evento = await qb.getOne();

    if (!evento) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(evento.fechaEvento);
    fechaEvento.setHours(0, 0, 0, 0);
    const estaActivo = fechaEvento >= hoy;

    const dto = this.mapToEventoListDto(evento);

    const institucion = evento.idSalon?.idLocal?.idInstitucion;

    return {
      ...dto,

      adquirido: !!evento.eventosUsuarios?.length,

      fechaCompra: evento.eventosUsuarios?.[0]?.fechaRegistro ?? null,

      QR: estaActivo // ← Solo devuelve QR si está activo
        ? (evento.eventosUsuarios?.[0]?.qrToken ?? null)
        : null,
      estaActivo,

      institucion: institucion
        ? {
            idInstitucion: institucion.idInstitucion,
            nombre: institucion.nombre,
            direccion: institucion.direccion ?? null,
            ciudad: institucion.ciudad ?? null,
          }
        : null,
    };
  }

  async getEventosByFecha(fecha: Date) {
    return this.eventoRepository.find({
      where: { fechaEvento: fecha },
      relations: ["idSalon", "idSubsalon", "eventosUsuarios"],
      order: { fechaEvento: "ASC" },
    });
  }

  async getEventosRangoFecha(fechaInicio: Date, fechaFin: Date) {
    return this.eventoRepository
      .createQueryBuilder("evento")
      .where("evento.fechaEvento BETWEEN :inicio AND :fin", {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .leftJoinAndSelect("evento.idSalon", "salon")
      .leftJoinAndSelect("evento.idSubsalon", "subsalon")
      .leftJoinAndSelect("evento.eventosUsuarios", "eu")
      .orderBy("evento.fechaEvento", "ASC")
      .getMany();
  }

  async getEventosPorSalon(idSalon: number) {
    return this.eventoRepository.find({
      where: { idSalon: { idSalon } },
      relations: ["idSalon", "idSubsalon", "eventosUsuarios"],
    });
  }

  async getEventosPorBusqueda(texto: string) {
    return this.eventoRepository
      .createQueryBuilder("evento")
      .where(
        "LOWER(evento.titulo) LIKE :texto OR LOWER(evento.descripcion) LIKE :texto",
        { texto: `%${texto.toLowerCase()}%` },
      )
      .leftJoinAndSelect("evento.idSalon", "salon")
      .leftJoinAndSelect("evento.idSubsalon", "subsalon")
      .getMany();
  }

  async getEventosFiltrados(
    idCliente: string,
    page = 1,
    limit = 10,
    filtros: {
      texto?: string;
      fechaInicio?: string;
      fechaFin?: string;
      idInstitucion?: number;
      soloDisponibles?: boolean;
    } = {},
  ) {
    const qb = EventosQueries.baseEventosUsuario(
      this.eventoRepository.createQueryBuilder("e"),
      idCliente,
    ).andWhere("e.horaFin > SYSDATE");

    // Filtro por texto (título o descripción)
    if (filtros.texto) {
      qb.andWhere(
        "(LOWER(e.titulo) LIKE :texto OR LOWER(e.descripcion) LIKE :texto)",
        { texto: `%${filtros.texto.toLowerCase()}%` },
      );
    }

    // Filtro por rango de fechas
    if (filtros.fechaInicio) {
      qb.andWhere("e.fechaEvento >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')", {
        fechaInicio: filtros.fechaInicio.substring(0, 10), // '2026-03-01'
      });
    }
    if (filtros.fechaFin) {
      qb.andWhere("e.fechaEvento <= TO_DATE(:fechaFin, 'YYYY-MM-DD')", {
        fechaFin: filtros.fechaFin.substring(0, 10), // '2026-03-02'
      });
    }

    // Filtro por institución
    if (filtros.idInstitucion) {
      qb.andWhere("i.idInstitucion = :idInstitucion", {
        idInstitucion: filtros.idInstitucion,
      });
    }

    // Solo eventos con cupos disponibles
    if (filtros.soloDisponibles) {
      qb.andWhere(
        "(SELECT COUNT(1) FROM EVENTOS_USUARIOS eu2 WHERE eu2.ID_EVENTO = e.idEvento AND eu2.ESTADO = 'S') < e.publicoEsperado",
      );
    }

    qb.orderBy("e.destacado", "DESC")
      .addOrderBy("e.fechaEvento", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((e) => this.mapToEventoListDto(e)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    };
  }
}
