import { Entity, EntityManager } from "typeorm"; // ← cambiar el import
import { EstadoTarjeta } from "../../common/enums/EstadoTarjeta.enum.js";
import { AppError } from "../../common/utils/App.error.js";

export async function obtenerUsuario(
  manager: EntityManager,
  idUsuario: string,
) {
  return manager
    .createQueryBuilder()
    .select([
      "u.ID_CLIENTE",
      "u.NOMBRE",
      "u.APELLIDO",
      "u.EMAIL",
      "u.NUMERO_ID",
      "u.TIPO_ID",
    ])
    .from("USUARIOS", "u")
    .where("u.ID_CLIENTE = :idUsuario", { idUsuario })
    .getRawOne();
}

export async function obtenerEvento(manager: EntityManager, idEvento: number) {
  console.log("obtenerEvento", idEvento);
  const qb = manager
    .createQueryBuilder()
    .select([
      "e.ID_EVENTO",
      "e.TITULO",
      "e.PRECIO",
      "e.PUBLICO_ESPERADO",
      "e.FECHA_EVENTO",
      "e.COD_ITEM",
      "e.MONTO_IVA",
      "e.INCLUYE_IVA"
    ])
    .from("EVENTOS", "e")
    .where("e.ID_EVENTO = :idEvento", { idEvento });

  console.log(qb.getSql());

  return await qb.getRawOne();
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
      "i.URL_COD_PAGO             AS URL_COD_PAGO",
      "i.URL_PROCESO_PAGO         AS URL_PROCESO_PAGO",
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

export async function obtenerDatosProcesoPago(
  manager: EntityManager,
  idEvento: number,
  idUsuario: string,
  referencia: string,
) {
  const result = await manager
    .createQueryBuilder()
    .select([
      "p.REFERENCIA         AS REFERENCIA",
      "p.TRANSACCION_ID     AS TRANSACCION_ID",
      "p.MONTO              AS MONTO",
      "p.ESTADO             AS ESTADO",
      "p.DETALLE_ESTADO     AS DETALLE_ESTADO",
      "p.FECHA_PAGO         AS FECHA_PAGO",

      "u.NOMBRE            AS NOMBRE",
      "u.EMAIL             AS EMAIL",
      "u.NUMERO_ID         AS NUMERO_ID",
      "u.TIPO_ID           AS TIPO_ID",

      "e.COD_ITEM          AS COD_ITEM",
      "e.MONTO_IVA         AS MONTO_IVA",
      "e.PRECIO            AS PRECIO",
    ])
    .from("PAGOS", "p")
    .innerJoin("USUARIOS", "u", "u.ID_CLIENTE = p.ID_CLIENTE")
    .innerJoin("EVENTOS", "e", "e.ID_EVENTO = p.ID_EVENTO")
    .where("p.ID_EVENTO = :idEvento", { idEvento })
    .andWhere("p.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("p.REFERENCIA = :referencia", { referencia })
    .getRawOne();

  if (!result) {
    throw new AppError("Pago no encontrado", 404);
  }

  return result;
}
