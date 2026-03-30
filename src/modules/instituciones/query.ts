import { EntityManager } from "typeorm";

export async function obtenerInstitucionesPorUsuario(
    manager: EntityManager,
    idUsuario: string
) {
    return manager
        .createQueryBuilder()
        .select([
            "i.ID_INSTITUCION",
            "i.NOMBRE",
            "i.PROVEEDOR_PAGO"
        ])
        .from("USUARIO_INSTITUCIONES", "ui")
        .innerJoin("INSTITUCIONES", "i", "i.ID_INSTITUCION = ui.ID_INSTITUCION")
        .where("ui.ID_CLIENTE = :idUsuario", { idUsuario })
        .getRawMany();
}