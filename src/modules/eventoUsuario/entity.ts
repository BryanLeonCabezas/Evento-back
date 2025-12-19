import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuarios } from "../usuario/entity.js";
import { Eventos } from "../evento/entity.js";


@Index("SYS_C0012872", ["idEventoUsuario"], { unique: true })
@Entity("EVENTOS_USUARIOS")
export class EventosUsuarios {
  @Column("number", { primary: true, name: "ID_EVENTO_USUARIO" })
  idEventoUsuario: number;

  @Column("char", { name: "ESTADO", nullable: true, length: 1 })
  estado: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro: Date | null;

  @Column("varchar2", { name: "OBSERVACION", nullable: true, length: 500 })
  observacion: string | null;

  @ManyToOne(() => Eventos, (eventos) => eventos.eventosUsuarios)
  @JoinColumn([{ name: "ID_EVENTO", referencedColumnName: "idEvento" }])
  idEvento: Eventos;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.eventosUsuarios)
  @JoinColumn([{ name: "ID_CLIENTE", referencedColumnName: "idCliente" }])
  idCliente: Usuarios;
}
