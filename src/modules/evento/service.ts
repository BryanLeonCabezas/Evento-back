import { EventoListDto } from "./dto/evento-list.js";
import { eventoRepository } from "./repository.js";

export class EventoService {
  private eventoRepository = eventoRepository;

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

      institucion: {
        nombre: evento.idSalon.idLocal.idInstitucion.nombre,
        direccion: evento.idSalon.idLocal.idInstitucion.direccion,
        ciudad: evento.idSalon.idLocal.idInstitucion.ciudad,
      },
    };
  }

  async getEventos(page = 1, limit = 10) {
    const qb = this.eventoRepository
      .createQueryBuilder("e")
      .leftJoin("e.idSalon", "s")
      .leftJoin("s.idLocal", "l")
      .leftJoin("l.idInstitucion", "i")
      .leftJoin("e.idSubsalon", "ss")
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
      ])
      .orderBy("e.destacado", "DESC")
      .addOrderBy("e.ordenDestacado", "ASC")
      .addOrderBy("e.fechaEvento", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((evento) => this.mapToEventoListDto(evento)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async geteventoById(id: number) {
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

    return this.mapToEventoListDto(evento);
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
