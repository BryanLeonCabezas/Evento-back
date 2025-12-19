import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuarios } from "../usuario/entity.js";
import { Instituciones } from "../instituciones/entity.js";


@Index("USUARIO_INSTITUCIONES_PK", ["idUsuarioInstituciones"], { unique: true })
@Entity("USUARIO_INSTITUCIONES")
export class UsuarioInstituciones {
  @Column("char", { name: "ESTADO", nullable: true, length: 1 })
  estado: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro: Date | null;

  @Column("number", {
    primary: true,
    name: "ID_USUARIO_INSTITUCIONES",
    precision: 38,
    scale: 0,
  })
  idUsuarioInstituciones: number;

  @ManyToOne(
    () => Instituciones,
    (instituciones) => instituciones.usuarioInstituciones
  )
  @JoinColumn([
    { name: "ID_INSTITUCION", referencedColumnName: "idInstitucion" },
  ])
  idInstitucion: Instituciones;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.usuarioInstituciones)
  @JoinColumn([{ name: "ID_CLIENTE", referencedColumnName: "idCliente" }])
  idCliente: Usuarios;
}
