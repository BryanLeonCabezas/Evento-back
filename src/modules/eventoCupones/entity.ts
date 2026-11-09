import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Eventos } from "../evento/entity.js";


@Index("SYS_C0013017", ["idCupon"], { unique: true })
@Index("UQ_CUPON_EVENTO_CODIGO", ["idEvento", "codigo"], { unique: true })
@Entity("EVENTO_CUPONES")
export class EventoCupones {
  @Column("number", {
    name: "USOS",
    nullable: true,
    default: () => "0",
  })
  usos!: number | null;


  @Column("number", {
    name: "MAX_USOS",
    nullable: true,
  })
  maxUsos!: number | null;


  @Column("char", {
    name: "TIPO_DESCUENTO",
    nullable: true,
    length: 1,
    default: () => "'M'",
  })
  tipoDescuento!: string | null;


  @Column("number", {
    name: "MONTO_DESCUENTO",
  })
  montoDescuento!: number;


  @Column("number", {
    name: "ID_EVENTO",
  })
  idEvento!: number;


  @Column("number", {
    primary: true,
    name: "ID_CUPON",
  })
  idCupon!: number;


  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro!: Date | null;


  @Column("varchar2", {
    name: "CODIGO",
    length: 50,
  })
  codigo!: string;


  @Column("char", {
    name: "ACTIVO",
    nullable: true,
    length: 1,
    default: () => "'S'",
  })
  activo!: string | null;


  @ManyToOne(
    () => Eventos,
    (eventos) => eventos.eventoCupones,
  )
  @JoinColumn([
    {
      name: "ID_EVENTO",
      referencedColumnName: "idEvento",
    },
  ])
  evento!: Eventos;
}