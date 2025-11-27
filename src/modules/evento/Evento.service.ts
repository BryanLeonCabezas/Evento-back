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
}
