import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { UsuarioInstituciones } from "../usuarioIntituciones/entity.js";
import { Locales } from "../locales/entity.js";
import { TarjetasUsuario } from "../tarjetaUsuario/entity.js";

@Index("SYS_C0012848", ["idInstitucion"], { unique: true })
@Entity("INSTITUCIONES")
export class Instituciones {
  @Column("number", { primary: true, name: "ID_INSTITUCION" })
  idInstitucion!: number;

  @Column("varchar2", { name: "NOMBRE", length: 150 })
  nombre!: string;

  @Column("varchar2", { name: "DIRECCION", nullable: true, length: 250 })
  direccion!: string | null;

  @Column("varchar2", { name: "CIUDAD", nullable: true, length: 100 })
  ciudad!: string | null;

  @Column("varchar2", { name: "PAIS", nullable: true, length: 100 })
  pais!: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro!: Date | null;

  @Column("varchar2", { name: "CODIGO_CONEXION", nullable: true, length: 20 })
  codigoConexion!: string | null;

  @Column("varchar2", { name: "USUARIO_PASARELA", nullable: true, length: 20 })
  usuarioPasarela?: string | null;

  @Column("varchar2", {
    name: "CONTRASENA_PASARELA",
    nullable: true,
    length: 20,
  })
  contrasenaPasarela?: string | null;

  @Column("varchar2", { name: "TOKEN_PASARELA", nullable: true, length: 20 })
  tokenPasarela?: string | null;

  @Column("varchar2", { name: "PROVEEDOR_PAGO", nullable: true, length: 100 })
  proveedorPago?: string | null;

  @Column("varchar2", {
    name: "PAYMENT_ENVIROMENT",
    nullable: true,
    length: 20,
  })
  paymentEnvironment?: string | null;

  @Column("varchar2", {
    name: "APP_CODE_TOKENIZATION",
    nullable: true,
    length: 100,
  })
  applicationCode?: string | null;

  @Column("varchar2", {
    name: "APP_KEY_TOKENIZATION",
    nullable: true,
    length: 100,
  })
  applicationKey?: string | null;

  @Column("varchar2", {
    name: "APP_CODE_CHECKOUT",
    nullable: true,
    length: 100,
  })
  applicationCodeCheckout?: string | null;

  @Column("varchar2", {
    name: "APP_KEY_CHECKOUT",
    nullable: true,
    length: 100,
  })
  applicationKeyCheckout?: string | null;

  @OneToMany(() => Locales, (locales) => locales.idInstitucion)
  locales!: Locales[];

  @OneToMany(
    () => UsuarioInstituciones,
    (usuarioInstituciones) => usuarioInstituciones.idInstitucion,
  )
  usuarioInstituciones?: UsuarioInstituciones[];

  @OneToMany(() => TarjetasUsuario, (tarjeta) => tarjeta.institucion)
  tarjetasUsuario?: TarjetasUsuario[];
}
