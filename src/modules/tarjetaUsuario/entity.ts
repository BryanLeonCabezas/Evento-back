import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuarios } from "../usuario/entity.js";
import { Instituciones } from "../instituciones/entity.js";

@Entity("TARJETAS_USUARIO")
export class TarjetasUsuario {
  @PrimaryGeneratedColumn({ name: "ID_TARJETA", type: "number" })
  idTarjeta!: number;

  //RELACIÓN CON USUARIOS
  @ManyToOne(() => Usuarios, (usuario) => usuario.tarjetas, { nullable: false })
  @JoinColumn({ name: "ID_CLIENTE", referencedColumnName: "idCliente" })
  usuario!: Usuarios;

  @Column("varchar2", { name: "EMAIL", length: 150 })
  email!: string;

  @Column("varchar2", { name: "TOKEN", length: 200 })
  token!: string;

  @Column("varchar2", {
    name: "LAST4",
    length: 4,
  })
  last4?: string;

  @Column("varchar2", { name: "BIN", length: 6, nullable: true })
  bin?: string | null;

  @Column("varchar2", { name: "TIPO", length: 20 })
  tipo?: string; // VISA, MASTERCARD

  @Column("varchar2", { name: "BANCO", length: 100, nullable: true })
  banco?: string | null;

  @Column("number", { name: "EXPIRY_MONTH", precision: 2 })
  expiryMonth?: number;

  @Column("number", { name: "EXPIRY_YEAR", precision: 4 })
  expiryYear?: number;

  @Column("varchar2", { name: "STATUS", length: 20 })
  status?: string;

  @Column("varchar2", { name: "ORIGIN", length: 50, nullable: true })
  origin?: string | null;

  @Column("varchar2", {
    name: "TRANSACTION_REFERENCE",
    length: 100,
    nullable: true,
  })
  transactionReference?: string | null;

  @Column("varchar2", {
    name: "HOLDER_NAME",
    length: 100,
    nullable: true,
  })
  holderName?: string | null;

  @Column("number", { name: "PREDETERMINADO", precision: 1 })
  predeterminado?: number;

  @Column("date", { name: "FECHA_REGISTRO" })
  fechaRegistro!: Date;

  @Column("number", { name: "ID_INSTITUCION" })
  idInstitucion?: number;

  @ManyToOne(() => Instituciones, (inst) => inst.tarjetasUsuario)
  @JoinColumn({ name: 'ID_INSTITUCION' })
  institucion?: Instituciones;


}
