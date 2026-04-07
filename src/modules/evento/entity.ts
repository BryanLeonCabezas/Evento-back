import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { Subsalones } from "../subsalones/entity.js";
import { Salones } from "../salones/entity.js";
import { EntradasEvento } from "../entradaEvento/entity.js";

@Index("SYS_C0012867", ["idEvento"], { unique: true })
@Entity("EVENTOS")
export class Eventos {
  @Column("number", { primary: true, name: "ID_EVENTO" })
  idEvento!: number;

  @Column("varchar2", { name: "TITULO", length: 200 })
  titulo!: string;

  @Column("varchar2", { name: "DESCRIPCION", nullable: true, length: 2000 })
  descripcion!: string | null;

  @Column( { name: "FECHA_EVENTO", type: "timestamp" })
  fechaEvento!: Date;

  @Column( { name: "HORA_INICIO", type: "timestamp"  })
  horaInicio!: Date;

  @Column( { name: "HORA_FIN", type: "timestamp" })
  horaFin!: Date;

  @Column("number", {
    name: "TIEMPO_SETUP_MIN",
    nullable: true,
    default: () => "0",
  })
  tiempoSetupMin!: number | null;

  @Column("number", {
    name: "TIEMPO_CLEAN_MIN",
    nullable: true,
    default: () => "0",
  })
  tiempoCleanMin!: number | null;

  @Column("number", { name: "PUBLICO_ESPERADO", nullable: true })
  publicoEsperado!: number | null;

  @Column("varchar2", { name: "IMAGEN_URL", nullable: true, length: 500 })
  imagenUrl!: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro!: Date | null;

  @Column({
    name: "DESTACADO",
    type: "number",
    precision: 1,
    default: 0,
  })
  destacado!: number;

  @Column({
    name: "FECHA_DESTACADO",
    type: "timestamp",
    nullable: true,
  })
  fechaDestacado?: Date;

  @Column({
    name: "ORDEN_DESTACADO",
    type: "number",
    nullable: true,
  })
  ordenDestacado?: number;

  @Column("number", { name: "PRECIO", nullable: true, precision: 10, scale: 2 })
  precio?: number | null;

  @ManyToOne(() => Salones, (salones) => salones.eventos)
  @JoinColumn([{ name: "ID_SALON", referencedColumnName: "idSalon" }])
  idSalon!: Salones;

  @ManyToOne(() => Subsalones, (subsalones) => subsalones.eventos)
  @JoinColumn([{ name: "ID_SUBSALON", referencedColumnName: "idSubsalon" }])
  idSubsalon?: Subsalones;

  @OneToMany(
    () => EventosUsuarios,
    (eventosUsuarios) => eventosUsuarios.idEvento,
  )
  eventosUsuarios?: EventosUsuarios[];

  @OneToMany(() => EntradasEvento, (entrada) => entrada.evento)
  entradas?: EntradasEvento[];
}
