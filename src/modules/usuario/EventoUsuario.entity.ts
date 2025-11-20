import { Column, Entity, Index } from "typeorm";

@Index("eventos_usuarios_email_key", ["email"], { unique: true })
@Index("eventos_usuarios_pkey", ["idCliente"], { unique: true })
@Entity("eventos_usuarios", { schema: "public" })
export class EventosUsuarios {
  @Column("uuid", { primary: true, name: "id_cliente" })
  idCliente!: string;

  @Column("character varying", { name: "email", unique: true, length: 150 })
  email?: string;

  @Column("character varying", { name: "nombre", nullable: true, length: 100 })
  nombre?: string | null;

  @Column("character varying", {
    name: "apellido",
    nullable: true,
    length: 100,
  })
  apellido?: string | null;

  @Column("date", { name: "fecha_nacimiento", nullable: true })
  fechaNacimiento?: string | null;

  @Column("character varying", { name: "genero", nullable: true, length: 20 })
  genero?: string | null;

  @Column("character varying", {
    name: "direccion",
    nullable: true,
    length: 250,
  })
  direccion?: string | null;

  @Column("character varying", {
    name: "foto_url",
    nullable: true,
    length: 500,
  })
  fotoUrl?: string | null;

  @Column("character varying", {
    name: "clave_hash",
    nullable: true,
    length: 500,
  })
  claveHash?: string | null;

  @Column("character varying", {
    name: "google_id",
    nullable: true,
    length: 100,
  })
  googleId?: string | null;

  @Column("character varying", {
    name: "tipo_usuario",
    nullable: true,
    length: 20,
    default: () => "'NORMAL'",
  })
  tipoUsuario?: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_creacion",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaCreacion?: Date | null;

  @Column("timestamp without time zone", {
    name: "fecha_actualizacion",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaActualizacion?: Date | null;

  @Column("character varying", {
    name: "numero_celular",
    nullable: true,
    length: 20,
  })
  numeroCelular?: string | null;

  @Column("character varying", {
    name: "refresh_token",
    nullable: true,
    length: 1000,
  })
  refreshToken?: string | null;
}
