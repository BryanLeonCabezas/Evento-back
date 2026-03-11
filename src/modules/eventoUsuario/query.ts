import { Repository } from "typeorm";
import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";


// evento.query.ts
export async function obtenerEvento(
  repository: Repository<any>,
  idEvento: number
) {
  return repository
    .createQueryBuilder()
    .select([
      "e.ID_EVENTO",
      "e.TITULO",
      "e.PRECIO",
      "e.PUBLICO_ESPERADO",
      "e.FECHA_EVENTO",
    ])
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function obtenerPrecioEvento(
  repository: Repository<any>,
  idEvento: number
) {
  return repository
    .createQueryBuilder()
    .select("e.PRECIO", "PRECIO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function obtenerUsuario(repository: Repository<any>, idUsuario: string) {
    return repository.createQueryBuilder()
    .select(["u.ID_CLIENTE", "u.NOMBRE", "u.APELLIDO", "u.EMAIL"])
    .from("USUARIOS", "u")
    .where("u.ID_CLIENTE = :idUsuario", { idUsuario })
    .getRawOne();
}

export async function usuarioYaInscrito(
  repository: Repository<any>,
  idEvento: number,
  idUsuario: string
) {
  return repository
    .createQueryBuilder()
    .select("1")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("eu.ESTADO IN ('A','S','N')")
    .getExists();
}


export async function obtenerPublicoEsperado(repository: Repository<any>, idEvento: number) {
    return repository.createQueryBuilder()
    .select("e.PUBLICO_ESPERADO", "PUBLICO_ESPERADO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

// evento-usuario.query.ts
export async function contarInscritos(
  repository: Repository<any>,
  idEvento: number
) {
  return repository
    .createQueryBuilder()
    .select("COUNT(1)", "INSCRITOS")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ESTADO = 'A'")
    .getRawOne();
}




export async function existeSuscripcionActiva(
  repository: Repository<any>,
  idEvento: number,
  idUsuario: string
) {
  return repository
    .createQueryBuilder("eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("eu.ESTADO = 'A'")
    .getExists();
}


export async function reactivarSuscripcion(
  repository: Repository<any>,
  idEvento: number,
  idUsuario: string,
  estado: EstadoEventoUsuario,
  observacion?: string
) {
  return repository
    .createQueryBuilder()
    .update("EVENTOS_USUARIOS")
    .set({
      estado,
      observacion: observacion ?? null,
    })
    .where("ID_CLIENTE = :idCliente", { idCliente: idUsuario })
    .andWhere("ID_EVENTO = :idEvento", { idEvento })
    .andWhere("ESTADO = 'I'")
    .execute();
}


// tarjeta.query.ts
export async function obtenerTarjetaUsuario(
  repository: Repository<any>,
  idTarjeta?: number,
  idUsuario?: string
) {
    console.log("obtenerTarjetaUsuario - idTarjeta:", idTarjeta, "idUsuario:", idUsuario);
  return repository
    .createQueryBuilder()
    .select(["t.ID_TARJETA", "t.TOKEN", "t.STATUS"])
    .from("TARJETAS_USUARIO", "t")
    .where("t.ID_TARJETA = :idTarjeta", { idTarjeta })
    .andWhere("t.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("t.STATUS = :status", { status: EstadoTarjeta.ACTIVA })
    .getRawOne();
}