import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuarios } from "../usuario/entity.js";
import { Eventos } from "../evento/entity.js";
import { Pagos } from "../pagos/entity.js";

@Index("SYS_C0012872", ["idEventoUsuario"], { unique: true })
@Entity("EVENTOS_USUARIOS")
export class EventosUsuarios {
  @PrimaryGeneratedColumn({
    name: "ID_EVENTO_USUARIO",
    //sequenceName: "SEQ_EVENTOS_USUARIOS", // ← le dice a TypeORM qué secuencia usar
  })
  idEventoUsuario!: number;

  @Column("char", { name: "ESTADO", nullable: true, length: 1 })
  estado!: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro!: Date | null;

  @Column("varchar2", { name: "QR_TOKEN", nullable: true, length: 100 })
  qrToken?: string | null;

  @Column("char", { name: "ASISTIO", nullable: true, length: 1 })
  asistio?: string | null;

  @Column("date", {
    name: "FECHA_ENTRADA",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaEntrada!: Date | null;

  @Column("varchar2", { name: "OBSERVACION", nullable: true, length: 500 })
  observacion?: string | null;

  @ManyToOne(() => Eventos, (eventos) => eventos.eventosUsuarios)
  @JoinColumn([{ name: "ID_EVENTO", referencedColumnName: "idEvento" }])
  idEvento!: Eventos;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.eventosUsuarios)
  @JoinColumn([{ name: "ID_CLIENTE", referencedColumnName: "idCliente" }])
  idCliente!: Usuarios;

  @OneToMany(() => Pagos, (pago) => pago.eventoUsuario)
  pagos?: Pagos[];
}
