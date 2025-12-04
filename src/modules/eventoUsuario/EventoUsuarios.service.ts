import { AppError } from "../../common/utils/App.error.js";
import { eventoUsuarioReposiroty } from "./EventoUsuarios.repository.js";

export class EventoUsuarioService {
  private eventoUsuarioReposiroty = eventoUsuarioReposiroty;

  async suscribirUsuario(idEvento: number, idUsuario: string) {
    const existe = await this.eventoUsuarioReposiroty.findOne({
      where: {
        idCliente: { idCliente: idUsuario },
        idEvento: { idEvento },
      },
    });

    if (existe) {
      throw new AppError("El usuario ya esta suscripto al evento", 400);
    }

    const nuevo = this.eventoUsuarioReposiroty.create({
      idEvento: { idEvento },
      idCliente: { idCliente: idUsuario },
    });

    await this.eventoUsuarioReposiroty.save(nuevo);
    return {
      message: "Usuario suscripto correctamente",
    };
  }

  async eliminarSuscripcion(idEvento: number, idUsuario: string) {
    const existe = await this.eventoUsuarioReposiroty.findOne({
      where: {
        idCliente: { idCliente: idUsuario },
        idEvento: { idEvento },
      },
    });

    if (!existe) {
      throw new AppError("El usuario no esta suscripto al evento", 400);
    }

    await this.eventoUsuarioReposiroty.remove(existe);

    return {
      message: "Usuario desuscripto correctamente",
    };
  }

  async obtenerUsuariosSuscritosXEvento(idEvento: number) {
    const usuarios = await this.eventoUsuarioReposiroty.find({
      where: {
        idEvento: { idEvento },
      },
      relations: ["idCliente"],
    });
  }

  async obtenerEventosSuscritosXUsuario(idUsuario: string) {
    return await this.eventoUsuarioReposiroty.find({
      where: {
        idCliente: { idCliente: idUsuario },
      },
      relations: ["idEvento"],
    });
  }
}
