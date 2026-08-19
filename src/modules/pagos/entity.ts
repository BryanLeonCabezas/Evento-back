import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { TipoPago } from "./dto/pago-normalizado.dto.js";

@Entity("PAGOS")
export class Pagos {
  @PrimaryGeneratedColumn({ name: "ID_PAGO", type: "number" })
  idPago!: number;


  @ManyToOne(() => EventosUsuarios, (eu) => eu.pagos, { nullable: true })
  @JoinColumn({ name: "ID_EVENTO_USUARIO" })
  eventoUsuario!: EventosUsuarios | null;

  @Column("number", { name: "ID_EVENTO", nullable: true })
  idEvento!: number | null;

  @Column("varchar2", { name: "ID_CLIENTE", length: 100, nullable: true })
  idCliente!: string | null;

  @Column("varchar2", { name: "TIPO_PAGO", length: 20 })
  tipoPago!: TipoPago;

  @Column("varchar2", { name: "REFERENCIA", length: 100, unique: true })
  referencia?: string;

  @Column("varchar2", { name: "PASARELA", length: 50, nullable: true })
  pasarela?: string | null; //

  @Column("varchar2", { name: "TRANSACCION_ID", length: 150, nullable: true })
  transaccionId?: string | null; //

  @Column("number", { name: "MONTO", precision: 10, scale: 2, default: 0 })
  monto?: number;

  @Column("varchar2", { name: "MONEDA", length: 10, default: "USD" })
  moneda?: string;

  @Column("varchar2", { name: "ESTADO", length: 20 })
  estado?: string;

  @Column("varchar2", { name: "DETALLE_ESTADO", length: 255, nullable: true })
  detalleEstado?: string | null; //

  @Column("varchar2", { name: "METODO_PAGO", length: 50, nullable: true })
  metodoPago?: string | null; //

  @Column("varchar2", { name: "MARCA_TARJETA", length: 20, nullable: true })
  marcaTarjeta?: string | null; //

  @Column("char", { name: "ULTIMOS_4", length: 4, nullable: true })
  ultimos4?: string | null; //

  @Column("char", { name: "ES_GRATIS", length: 1, default: "N" })
  esGratis?: string;

  @Column("date", { name: "FECHA_PAGO", nullable: true })
  fechaPago?: Date | null; //

  @Column("date", { name: "FECHA_REGISTRO", default: () => "SYSDATE" })
  fechaRegistro?: Date;

  @Column("clob", { name: "RESPONSE_JSON", nullable: true })
  responseJson?: string | null; //

  @Column("varchar2",{ name: "ORIGEN_PAGO", nullable: true })
  origenPago?: "DEBITO" | "CHECKOUT";

  @Column("number", { name: "ID_CUPON", nullable: true })
  idCupon?: number;

  @Column("number", { name: "DESCUENTO_APLICADO", nullable: true })
  descuentoAplicado?: number;

}
