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
import { Archivos } from "../archivos/entity.js";
import { EventoExpositores } from "../eventoExpositores/entity.js";
import { Certificado } from "../certificados/entity.js";
import { EventoCupones } from "../eventoCupones/entity.js";
import { Locales } from "../locales/entity.js";

@Index("SYS_C0012867", ["idEvento"], { unique: true })
@Entity("EVENTOS")
export class Eventos {
  @Column("number", { primary: true, name: "ID_EVENTO" })
  idEvento!: number;

  @Column("varchar2", { name: "TITULO", length: 200 })
  titulo!: string;

  @Column("varchar2", { name: "DESCRIPCION", nullable: true, length: 2000 })
  descripcion!: string | null;

  @Column({ name: "FECHA_EVENTO", type: "timestamp" })
  fechaEvento!: Date;

  @Column("varchar2", { name: "HORA_INICIO", length: 20 })
  horaInicio!: string;

  @Column("varchar2", { name: "HORA_FIN", length: 20 })
  horaFin!: string;

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

  @Column("varchar2", { name: "COD_ITEM", nullable: true, length: 25 })
  codItem!: string | null;

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

  @Column({
    name: "NO_PUBLICAR",
    type: "char",
    length: 1,
    default: "N",
    nullable: true,
  })
  noPublicar!: "S" | "N";

  @Column({
    name: "INCLUYE_IVA",
    type: "char",
    length: 1,
    default: "N",
    nullable: true,
  })
  incluyeIva!: "S" | "N";

  @Column("number", {
    name: "MONTO_IVA",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  montoIva?: number | null;

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

  @OneToMany(() => Archivos, (archivo) => archivo.evento)
  archivos!: Archivos[];

  @OneToMany(() => EventoExpositores, (expositor) => expositor.evento)
  expositores?: EventoExpositores[];

  @OneToMany(() => Certificado, (certificado) => certificado.evento)
  certificados?: Certificado[];
  @OneToMany(() => EventoCupones, (eventoCupon) => eventoCupon.evento)
  eventoCupones?: EventoCupones[];

  @ManyToOne(() => Locales, (locales) => locales.eventos)
  @JoinColumn([{ name: "ID_LOCAL", referencedColumnName: "idLocal" }])
  idLocal?: Locales;
}
