import { EntityManager } from "typeorm";

export async function obtenerInstitucionPorId(
  manager: EntityManager,
  idInstitucion: number
) {
  return manager
    .createQueryBuilder()
    .select([
      "i.ID_INSTITUCION",
      "i.NOMBRE",
      "i.PROVEEDOR_PAGO",
      "i.USUARIO_PASARELA",
      "i.CONTRASENA_PASARELA",
      "i.TOKEN_PASARELA",
    ])
    .from("INSTITUCIONES", "i")
    .where("i.ID_INSTITUCION = :idInstitucion", { idInstitucion })
    .getRawOne();
}

export async function validarUsuarioInstitucion(
  manager: EntityManager,
  idUsuario: string,
  idInstitucion: number
) {
  return manager
    .createQueryBuilder()
    .select([
      "ui.ID_USUARIO",
      "ui.ID_INSTITUCION"
    ])
    .from("USUARIOS_INSTITUCIONES", "ui")
    .where("ui.ID_USUARIO = :idUsuario", { idUsuario })
    .andWhere("ui.ID_INSTITUCION = :idInstitucion", { idInstitucion })
    .getRawOne();
}


export async function usuarioPerteneceInstitucion(
  manager: EntityManager,
  idUsuario: string,
  idInstitucion: number
) {
  return manager
    .createQueryBuilder()
    .select("1")
    .from("USUARIO_INSTITUCIONES", "ui")
    .where("ui.ID_CLIENTE = :idUsuario", { idUsuario })
    .andWhere("ui.ID_INSTITUCION = :idInstitucion", { idInstitucion })
    .getRawOne();
}