import { EventoListDto } from "./dto/evento-list.js";
import { eventoRepository } from "./repository.js";
import { institucionRepository } from "../instituciones/repository.js";
import { EventosPorInstitucionDto } from "./dto/eventoPorInstitucion.js";
import { eventoNoFinalizado, EventosQueries } from "./querys.js";
import {
  formatLocalDate,
  formatTime,
} from "../../common/utils/ValidateRoutes.util.js";

const PROXIMOS_POR_INSTITUCION = 3;
const PROXIMOS_MAX_TOTAL = 10;
const DESTACADOS_MAX = 5;
const POR_INSTITUCION_MAX = 5;

export class EventoService {
  private eventoRepository = eventoRepository;
  private institucionRepository = institucionRepository;

  // ─── Mapping ───────────────────────────────────────────────

  private mapToEventoListDto(evento: any): EventoListDto {
    console.log("evento", evento);
    return {
      idEvento: evento.idEvento,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaEvento: formatLocalDate(evento.fechaEvento),
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin,
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
      fechaCompra: evento.eventosUsuarios?.[0]?.fechaRegistro ?? null,
      QR: evento.eventosUsuarios?.[0]?.qrToken ?? null,
      estaActivo: evento?.estaActivo,
    };
  }

  // Extrae el agrupamiento — estaba duplicado en getEventosByUsuario y getHomeEventos
  private agruparPorInstitucion(eventos: any[]): EventosPorInstitucionDto[] {
    const agrupado = eventos.reduce(
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

    return Object.values(agrupado);
  }

  // ─── Queries ───────────────────────────────────────────────

  async getEventosByUsuario(page = 1, limit = 10, idCliente: string) {
    const qb = EventosQueries.baseEventosUsuario(
      this.eventoRepository.createQueryBuilder("e"),
      idCliente,
    )
      .orderBy("e.destacado", "DESC")
      .addOrderBy("e.ordenDestacado", "ASC")
      .addOrderBy("e.fechaEvento", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data: this.agruparPorInstitucion(data) };
  }

  async getHomeEventos(idCliente: string) {
    // 3 queries paralelas — más rápido que secuencial
    const [proximos, destacados, eventosInstitucion] = await Promise.all([
      EventosQueries.proximos(
        EventosQueries.baseEventosUsuario(
          this.eventoRepository.createQueryBuilder("e"),
          idCliente,
        ),
      )
        // Sin take global — toma N por institución abajo
        .getMany(),

      EventosQueries.destacados(
        EventosQueries.baseEventosUsuario(
          this.eventoRepository.createQueryBuilder("e"),
          idCliente,
        ),
      )
        .take(5)
        .getMany(),

      EventosQueries.baseEventosUsuario(
        this.eventoRepository.createQueryBuilder("e"),
        idCliente,
      )
        .andWhere(
          `
(
  e.fechaEvento +
  (
    TO_DATE(e.horaFin, 'HH24:MI')
    - TRUNC(TO_DATE(e.horaFin, 'HH24:MI'))
  )
) >= SYSDATE
`,
        )
        .orderBy("i.idInstitucion", "ASC")
        .addOrderBy("e.fechaEvento", "ASC")
        .getMany(),
    ]);

    console.log("proximos", proximos);

    // Próximos: máximo 5 por institución, no 5 en total
    const proximosPorInstitucion = this.tomarNPorInstitucion(proximos, 3, 5);

    return {
      proximos: proximosPorInstitucion.map((e) => this.mapToEventoListDto(e)),
      destacados: destacados.map((e) => this.mapToEventoListDto(e)),
      porInstitucion: this.agruparPorInstitucion(eventosInstitucion),
    };
  }

  // N eventos por institución — evita que una institución con muchos eventos
  // acapare todos los slots de próximos
  private tomarNPorInstitucion(
    eventos: any[],
    nPorInstitucion: number,
    maxTotal: number,
  ): any[] {
    const conteo = new Map<number, number>();
    const resultado: any[] = [];

    for (const evento of eventos) {
      if (resultado.length >= maxTotal) break;

      const idInstitucion =
        evento.idSalon?.idLocal?.idInstitucion?.idInstitucion;
      if (!idInstitucion) continue;

      const actual = conteo.get(idInstitucion) ?? 0;
      if (actual < nPorInstitucion) {
        resultado.push(evento);
        conteo.set(idInstitucion, actual + 1);
      }
    }

    return resultado;
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
      QR: estaActivo ? (evento.eventosUsuarios?.[0]?.qrToken ?? null) : null,
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

  // Ahora filtra por instituciones suscritas del usuario
  async getEventosPorBusqueda(texto: string, idCliente: string) {
    return EventosQueries.baseEventosUsuario(
      this.eventoRepository.createQueryBuilder("e"),
      idCliente,
    )
      .andWhere(
        "(LOWER(e.titulo) LIKE :texto OR LOWER(e.descripcion) LIKE :texto)",
        { texto: `%${texto.toLowerCase()}%` },
      )
      .getMany()
      .then((eventos) => eventos.map((e) => this.mapToEventoListDto(e)));
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
    ).andWhere(eventoNoFinalizado());

    if (filtros.texto) {
      qb.andWhere(
        "(LOWER(e.titulo) LIKE :texto OR LOWER(e.descripcion) LIKE :texto)",
        { texto: `%${filtros.texto.toLowerCase()}%` },
      );
    }

    if (filtros.fechaInicio) {
      qb.andWhere("e.fechaEvento >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')", {
        fechaInicio: filtros.fechaInicio.substring(0, 10),
      });
    }

    if (filtros.fechaFin) {
      qb.andWhere("e.fechaEvento <= TO_DATE(:fechaFin, 'YYYY-MM-DD')", {
        fechaFin: filtros.fechaFin.substring(0, 10),
      });
    }

    if (filtros.idInstitucion) {
      qb.andWhere("i.idInstitucion = :idInstitucion", {
        idInstitucion: filtros.idInstitucion,
      });
    }

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
