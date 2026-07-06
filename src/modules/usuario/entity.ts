import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { UsuarioInstituciones } from "../usuarioIntituciones/entity.js";
import { TarjetasUsuario } from "../tarjetaUsuario/entity.js";
import { EntradasEvento } from "../entradaEvento/entity.js";

@Index("EVENTOS_USUARIOS_EMAIL_UK", ["email"], { unique: true })
@Entity("USUARIOS")
export class Usuarios {
  @PrimaryColumn("varchar2", { name: "ID_CLIENTE", length: 36 })
  idCliente!: string;

  @Column("varchar2", { primary: true, name: "EMAIL", length: 150 })
  email!: string;

  @Column("varchar2", { name: "NOMBRE", nullable: true, length: 100 })
  nombre?: string | null;

  @Column("varchar2", { name: "APELLIDO", nullable: true, length: 100 })
  apellido?: string | null;

  @Column("date", { name: "FECHA_NACIMIENTO", nullable: true })
  fechaNacimiento?: Date | null;

  @Column("varchar2", { name: "GENERO", nullable: true, length: 20 })
  genero?: string | null;

  @Column("varchar2", { name: "DIRECCION", nullable: true, length: 250 })
  direccion?: string | null;

  @Column("varchar2", { name: "FOTO_URL", nullable: true, length: 500 })
  fotoUrl?: string | null;

  @Column("varchar2", { name: "CLAVE_HASH", nullable: true, length: 500 })
  claveHash?: string | null;

  @Column("varchar2", { name: "GOOGLE_ID", nullable: true, length: 100 })
  googleId?: string | null;

  @Column("varchar2", {
    name: "TIPO_USUARIO",
    nullable: true,
    length: 20,
    default: () => "'NORMAL'",
  })
  tipoUsuario?: string | null;

  @Column("varchar2", {
    name: "VERIFICATION_TOKEN",
    nullable: true,
    length: 500,
  })
  verificationToken?: string | null;

  @Column("number", {
    name: "IS_VERIFIED",
    nullable: false,
    default: () => "0",
  })
  isVerified?: number; // 0 = no, 1 = sí

  @Column("timestamp", {
    name: "TOKEN_EXPIRA",
    nullable: true,
  })
  tokenExpira?: Date | null;

  @Column("timestamp", {
    name: "FECHA_CREACION",
    nullable: true,
    scale: 6,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaCreacion?: Date | null;

  @Column("timestamp", {
    name: "FECHA_ACTUALIZACION",
    nullable: true,
    scale: 6,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaActualizacion?: Date | null;

  @Column("varchar2", { name: "NUMERO_CELULAR", nullable: true, length: 20 })
  numeroCelular?: string | null;

  @Column("varchar2", { name: "REFRESH_TOKEN", nullable: true, length: 1000 })
  refreshToken?: string | null;

  @Column("varchar2", { name: "TIPO_ID", nullable: true, length: 20 })
  tipoId?: string | null;

  @Column("varchar2", { name: "NUMERO_ID", nullable: true, length: 20 })
  numeroId?: string | null;

  @Column("char", { name: "PERFIL_COMPLETO", nullable: true, length: 1 })
  perfilCompleto?: string | null;

  @Column("char", { name: "ONBOARDING_COMPLETO", nullable: true, length: 1 })
  onboardingCompleto?: string | null;

  @OneToMany(
    () => EventosUsuarios,
    (eventosUsuarios) => eventosUsuarios.idCliente,
  )
  eventosUsuarios?: EventosUsuarios[];

  @OneToMany(
    () => UsuarioInstituciones,
    (usuarioInstituciones) => usuarioInstituciones.idCliente,
  )
  usuarioInstituciones?: UsuarioInstituciones[];

  @OneToMany(() => TarjetasUsuario, (tarjeta) => tarjeta.usuario)
  tarjetas?: TarjetasUsuario[];

  @OneToMany(() => EntradasEvento, (entrada) => entrada.usuario)
  entradas?: EntradasEvento[];
}
