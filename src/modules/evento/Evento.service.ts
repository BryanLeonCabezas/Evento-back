import { eventoRepository } from "../evento/Evento.repository.js";

export class EventoService {
  private eventoRepository = eventoRepository;

  async getEventos(page = 1, limit = 10) {
    const [data, total] = await this.eventoRepository.findAndCount({
      relations: ["idSalon", "idSubsalon", "eventosUsuarios"],
      order: { fechaEvento: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async geteventoById(id: number) {
    const evento = await this.eventoRepository.findOneBy({ idEvento: id });
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
    return this.eventoRepository.createQueryBuilder("evento")
      .where("LOWER(evento.titulo) LIKE :texto OR LOWER(evento.descripcion) LIKE :texto", { texto: `%${texto.toLowerCase()}%` })
      .leftJoinAndSelect("evento.idSalon", "salon")
      .leftJoinAndSelect("evento.idSubsalon", "subsalon")
      .getMany();
  }
}
