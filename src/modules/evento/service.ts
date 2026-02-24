import { id } from "zod/locales";
import { EventoListDto } from "./dto/evento-list.js";
import { eventoRepository } from "./repository.js";
import { usuarioInstitucionesReposiroty } from "../usuarioIntituciones/repository.js";
import { institucionRepository } from "../instituciones/repository.js";
import { EventosPorInstitucionDto } from "./dto/eventoPorInstitucion.js";
import { EventosQueries } from "./querys.js";
import { log } from "node:console";

export class EventoService {
  private eventoRepository = eventoRepository;
  private institucionRepository = institucionRepository;

  private formatTime(value: any): string {
    console.log("Valor original:", value);
    if (!value) return "";

    const d = new Date(value);

    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");

    return `${hh}:${mm}`;
  }

  private mapToEventoListDto(evento: any): EventoListDto {
    return {
      idEvento: evento.idEvento,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaEvento: evento.fechaEvento,
      horaInicio: this.formatTime(evento.horaInicio),
      horaFin: this.formatTime(evento.horaFin),
      imagenUrl: evento.imagenUrl,
      precio: evento.precio,
      destacado: evento.destacado,
      ordenDestacado: evento.ordenDestacado,
      publicoEsperado: evento.publicoEsperado,
      tiempoSetupMin: evento.tiempoSetupMin,
      tiempoCleanMin: evento.tiempoCleanMin,
      fechaRegistro: evento.fechaRegistro,

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

  async getEventoById(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento: id },
      relations: {
        idSalon: {
          idLocal: {
            idInstitucion: true,
          },
        },
        idSubsalon: true,
      },
    });

    if (!evento) return null;

    const dto = this.mapToEventoListDto(evento);

    const institucion = evento.idSalon?.idLocal?.idInstitucion;

    return {
      ...dto,
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
}
