import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index
} from "typeorm";
import { Usuarios } from "../usuario/entity.js";
import { Eventos } from "../evento/entity.js";


@Entity("ENTRADAS_EVENTO")
@Index("UQ_ENTRADA_QR_TOKEN", ["qrToken"], { unique: true })
export class EntradasEvento {

  /* ================= PK ================= */

  @PrimaryGeneratedColumn({
    name: "ID_ENTRADA",
    type: "number"
  })
  idEntrada!: number;

  /* ================= RELACIONES ================= */

  @ManyToOne(() => Usuarios, usuario => usuario.entradas, { nullable: false })
  @JoinColumn({
    name: "ID_CLIENTE",               // FK en ENTRADAS_EVENTO
    referencedColumnName: "idCliente" // PK en USUARIOS
  })
  usuario!: Usuarios;

  @ManyToOne(() => Eventos, evento => evento.entradas, { nullable: false })
  @JoinColumn({
    name: "ID_EVENTO",
    referencedColumnName: "idEvento"
  })
  evento!: Eventos;

  /* ================= QR ================= */

  @Column({
    name: "QR_TOKEN",
    type: "varchar2",
    length: 255,
    nullable: false
  })
  qrToken!: string;

  @Column({
    name: "QR_HASH",
    type: "varchar2",
    length: 255,
    nullable: false
  })
  qrHash! : string;

  /* ================= ESTADO ================= */

  @Column({
    name: "ESTADO",
    type: "varchar2",
    length: 20,
    default: "ACTIVO",
    nullable: false
  })
  estado!: "ACTIVO" | "USADO" | "CANCELADO";

  /* ================= FECHAS ================= */

  @CreateDateColumn({
    name: "FECHA_COMPRA",
    type: "timestamp"
  })
  fechaCompra?: Date;

  @Column({
    name: "FECHA_USO",
    type: "timestamp",
    nullable: true
  })
  fechaUso?: Date;

  /* ================= CONTROL ================= */

  @Column({
    name: "INTENTOS_VALIDACION",
    type: "number",
    default: 0,
    nullable: false
  })
  intentosValidacion?: number;
}
