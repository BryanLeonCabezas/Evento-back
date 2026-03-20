import { EntityManager } from "typeorm"; // ← cambiar el import
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";

export async function obtenerUsuario(manager: EntityManager, idUsuario: string) {
  return manager.createQueryBuilder()  // ← manager en vez de repository
    .select(["u.ID_CLIENTE", "u.NOMBRE", "u.APELLIDO", "u.EMAIL"])
    .from("USUARIOS", "u")
    .where("u.ID_CLIENTE = :idUsuario", { idUsuario })
    .getRawOne();
}

export async function obtenerEvento(manager: EntityManager, idEvento: number) {
  return manager.createQueryBuilder()
    .select(["e.ID_EVENTO", "e.TITULO", "e.PRECIO", "e.PUBLICO_ESPERADO", "e.FECHA_EVENTO"])
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function obtenerPrecioEvento(manager: EntityManager, idEvento: number) {
  return manager.createQueryBuilder()
    .select("e.PRECIO", "PRECIO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function obtenerPublicoEsperado(manager: EntityManager, idEvento: number) {
  return manager.createQueryBuilder()
    .select("e.PUBLICO_ESPERADO", "PUBLICO_ESPERADO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function contarInscritos(manager: EntityManager, idEvento: number) {
  return manager.createQueryBuilder()
    .select("COUNT(1)", "INSCRITOS")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ESTADO = 'A'")
    .getRawOne();
}

export async function obtenerTarjetaUsuario(
  manager: EntityManager,
  idTarjeta?: number,
  idUsuario?: string
) {
  return manager.createQueryBuilder()
    .select(["t.ID_TARJETA", "t.TOKEN", "t.STATUS"])
    .from("TARJETAS_USUARIO", "t")
    .where("t.ID_TARJETA = :idTarjeta", { idTarjeta })
    .andWhere("t.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("t.STATUS = :status", { status: EstadoTarjeta.ACTIVA })
    .getRawOne();
}

export async function usuarioYaInscrito(
  manager: EntityManager,
  idEvento: number,
  idUsuario: string
) {
  return manager.createQueryBuilder()
    .select("1")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("eu.ESTADO IN ('A','S','N')")
    .getExists();
}