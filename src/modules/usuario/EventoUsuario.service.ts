import { TipoUsuarioEnum } from "../../common/enums/TipoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { hashPassword } from "../../common/utils/crypto.util.js";
import { CrearUsuarioDto } from "./dtos/CrearUsuario.dto.js";
import { eventoUsuarioRepository } from "./EventoUsuario.repository.js";

export const createEventoUsuario = async (eventoUsuario: CrearUsuarioDto) => {
  const repo = eventoUsuarioRepository;

  const exist = await repo.findOneBy({ email: eventoUsuario.email });
  if (exist) {
    throw new AppError("El correo ya se encuentra registrado", 400);
  }

  let usuarioEvento;

  if (eventoUsuario.tipoUsuario === TipoUsuarioEnum.GOOGLE) {
    usuarioEvento = repo.create({
      ...eventoUsuario,
      idCliente: crypto.randomUUID(),
      // No hay claveHash para Google
    });
    await repo.save(usuarioEvento);

    return {
      message: "Usuario creado con éxito",
      tipoUsuario: TipoUsuarioEnum.GOOGLE,
      email: usuarioEvento.email,
      nombre: usuarioEvento.nombre,
    };
  } else {
    usuarioEvento = repo.create({
      ...eventoUsuario,
      idCliente: crypto.randomUUID(),
      claveHash: hashPassword(eventoUsuario.claveHash!),
    });
    await repo.save(usuarioEvento);

    return {
      message: "Usuario creado con éxito",
      tipoUsuario: TipoUsuarioEnum.NORMAL,
      email: usuarioEvento.email,
      nombre: usuarioEvento.nombre,
    };
  }
};
