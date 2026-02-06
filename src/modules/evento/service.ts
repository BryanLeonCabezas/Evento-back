import { EventoListDto } from "./dto/evento-list.js";
import { eventoRepository } from "./repository.js";

export class EventoService {
  private eventoRepository = eventoRepository;

  private mapToEventoListDto(evento: any): EventoListDto{
    return {
      idEvento: evento.idEvento,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaEvento: evento.fechaEvento,
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin,
      imagenUrl: evento.imagenUrl,
      precio: evento.precio,
      destacado: evento.destacado,
      ordenDestacado: evento.ordenDestacado,

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
    };
  }

  async getEventos(page = 1, limit = 10) {
    const qb = this.eventoRepository
      .createQueryBuilder("e")
      .leftJoin("e.idSalon", "s")
      .leftJoin("e.idSubsalon", "ss")
      .select([
        "e.idEvento",
        "e.titulo",
        "e.descripcion",
        "e.fechaEvento",
        "e.horaInicio",
        "e.horaFin",
        "e.imagenUrl",
        "e.destacado",
        "e.ordenDestacado",
        "e.precio",
        "s.idSalon",
        "s.nombre",
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
      data : data.map((evento) => this.mapToEventoListDto(evento)),
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
        idSalon: true,
        idSubsalon: true,
      },
    });
    return evento;
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
