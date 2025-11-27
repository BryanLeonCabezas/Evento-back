import { Column, Entity, Index, OneToMany } from "typeorm";
import { EventosUsuarios } from "../eventoUsuario/EventosUsuarios.js";


@Index("EVENTOS_USUARIOS_EMAIL_UK", ["email"], { unique: true })
@Index("EVENTOS_USUARIOS_PK", ["idCliente"], { unique: true })
@Entity("USUARIOS")
export class Usuarios {
  @Column("varchar2", { name: "ID_CLIENTE", length: 36 })
  idCliente: string;

  @Column("varchar2", { primary: true, name: "EMAIL", length: 150 })
  email: string;

  @Column("varchar2", { name: "NOMBRE", nullable: true, length: 100 })
  nombre: string | null;

  @Column("varchar2", { name: "APELLIDO", nullable: true, length: 100 })
  apellido: string | null;

  @Column("date", { name: "FECHA_NACIMIENTO", nullable: true })
  fechaNacimiento: Date | null;

  @Column("varchar2", { name: "GENERO", nullable: true, length: 20 })
  genero: string | null;

  @Column("varchar2", { name: "DIRECCION", nullable: true, length: 250 })
  direccion: string | null;

  @Column("varchar2", { name: "FOTO_URL", nullable: true, length: 500 })
  fotoUrl: string | null;

  @Column("varchar2", { name: "CLAVE_HASH", nullable: true, length: 500 })
  claveHash: string | null;

  @Column("varchar2", { name: "GOOGLE_ID", nullable: true, length: 100 })
  googleId: string | null;

  @Column("varchar2", {
    name: "TIPO_USUARIO",
    nullable: true,
    length: 20,
    default: () => "'NORMAL'",
  })
  tipoUsuario: string | null;

  @Column("timestamp", {
    name: "FECHA_CREACION",
    nullable: true,
    scale: 6,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaCreacion: Date | null;

  @Column("timestamp", {
    name: "FECHA_ACTUALIZACION",
    nullable: true,
    scale: 6,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaActualizacion: Date | null;

  @Column("varchar2", { name: "NUMERO_CELULAR", nullable: true, length: 20 })
  numeroCelular: string | null;

  @Column("varchar2", { name: "REFRESH_TOKEN", nullable: true, length: 1000 })
  refreshToken: string | null;

  @OneToMany(
    () => EventosUsuarios,
    (eventosUsuarios) => eventosUsuarios.idCliente
  )
  eventosUsuarios: EventosUsuarios[];
}
