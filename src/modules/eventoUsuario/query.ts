import { Entity, EntityManager } from "typeorm"; // ← cambiar el import
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";
import { AppError } from "../../common/utils/App.error.js";

export async function obtenerUsuario(
  manager: EntityManager,
  idUsuario: string,
) {
  return manager
    .createQueryBuilder() // ← manager en vez de repository
    .select(["u.ID_CLIENTE", "u.NOMBRE", "u.APELLIDO", "u.EMAIL"])
    .from("USUARIOS", "u")
    .where("u.ID_CLIENTE = :idUsuario", { idUsuario })
    .getRawOne();
}

export async function obtenerEvento(manager: EntityManager, idEvento: number) {
  return manager
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
  manager: EntityManager,
  idEvento: number,
) {
  return manager
    .createQueryBuilder()
    .select("e.PRECIO", "PRECIO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function obtenerPublicoEsperado(
  manager: EntityManager,
  idEvento: number,
) {
  return manager
    .createQueryBuilder()
    .select("e.PUBLICO_ESPERADO", "PUBLICO_ESPERADO")
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();
}

export async function contarInscritos(
  manager: EntityManager,
  idEvento: number,
) {
  return manager
    .createQueryBuilder()
    .select("COUNT(1)", "INSCRITOS")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ESTADO = 'A'")
    .getRawOne();
}

export async function obtenerTarjetaUsuario(
  manager: EntityManager,
  idTarjeta?: number,
  idUsuario?: string,
) {
  return manager
    .createQueryBuilder()
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
  idUsuario: string,
) {
  return manager
    .createQueryBuilder()
    .select("1")
    .from("EVENTOS_USUARIOS", "eu")
    .where("eu.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("eu.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("eu.ESTADO IN ('A','S','N')")
    .getExists();
}

export async function obtenerDatosInstitucion(
  manager: EntityManager,
  idEvento: number,
) {
  const result = await manager
    .createQueryBuilder()
    .select([
      "i.ID_INSTITUCION      AS ID_INSTITUCION",
      "i.NOMBRE              AS NOMBRE",
      "i.PROVEEDOR_PAGO      AS PROVEEDOR_PAGO",
      "i.USUARIO_PASARELA    AS USUARIO_PASARELA",
      "i.CONTRASENA_PASARELA AS CONTRASENA_PASARELA",
      "i.TOKEN_PASARELA      AS TOKEN_PASARELA",
      "i.APP_CODE_CHECKOUT      AS APP_CODE_CHECKOUT",
      "i.APP_KEY_CHECKOUT       AS APP_KEY_CHECKOUT",
    ])
    .from("EVENTOS", "e")
    .innerJoin("SALONES", "s", "s.ID_SALON = e.ID_SALON")
    .innerJoin("LOCALES", "l", "l.ID_LOCAL = s.ID_LOCAL")
    .innerJoin("INSTITUCIONES", "i", "i.ID_INSTITUCION = l.ID_INSTITUCION")
    .where("e.ID_EVENTO = :idEvento", { idEvento })
    .getRawOne();

  if (!result) {
    throw new AppError("Institución no encontrada para el evento", 404);
  }

  return result;
}

// query.ts — agregar esta
export async function obtenerInstitucionPorUsuario(
  manager: EntityManager,
  idUsuario: string,
) {
  const result = await manager
    .createQueryBuilder()
    .select([
      "i.ID_INSTITUCION      AS ID_INSTITUCION",
      "i.NOMBRE              AS NOMBRE",
      "i.PROVEEDOR_PAGO      AS PROVEEDOR_PAGO",
      "i.USUARIO_PASARELA    AS USUARIO_PASARELA",
      "i.CONTRASENA_PASARELA AS CONTRASENA_PASARELA",
      "i.TOKEN_PASARELA      AS TOKEN_PASARELA",
    ])
    .from("INSTITUCIONES", "i")
    .innerJoin(
      "USUARIO_INSTITUCIONES",
      "ui",
      "ui.ID_INSTITUCION = i.ID_INSTITUCION",
    )
    .where("ui.ID_CLIENTE = :idUsuario", { idUsuario })
    .getRawOne();

  if (!result) {
    throw new AppError("Institución no encontrada para el usuario", 404);
  }

  return result;
}
