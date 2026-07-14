import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Eventos } from "../evento/entity.js";
import { Archivos } from "../archivos/entity.js";



@Entity("EVENTO_EXPOSITORES")
export class EventoExpositores {
  @PrimaryGeneratedColumn({
    name: "ID_EXPOSITOR",
    type: "number",
  })
  idExpositor!: number;

  @ManyToOne(() => Eventos, (evento) => evento.expositores, {
    nullable: false,
  })
  @JoinColumn({
    name: "ID_EVENTO",
    referencedColumnName: "idEvento",
  })
  evento!: Eventos;

  @Column({
    name: "NOMBRE_COMPLETO",
    type: "varchar2",
    length: 200,
  })
  nombreCompleto!: string;

  @Column({
    name: "CARGO",
    type: "varchar2",
    length: 200,
    nullable: true,
  })
  cargo?: string;

  @Column({
    name: "ORGANIZACION",
    type: "varchar2",
    length: 200,
    nullable: true,
  })
  organizacion?: string;

  @Column({
    name: "TAGLINE",
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  tagline?: string;

  @Column({
    name: "BIO",
    type: "clob",
    nullable: true,
  })
  bio?: string;

  @Column({
    name: "BIBLIOGRAFIA",
    type: "clob",
    nullable: true,
  })
  bibliografia?: string;

  @Column({
    name: "FOTO_URL",
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  fotoUrl?: string;

  @Column({
    name: "EMAIL",
    type: "varchar2",
    length: 200,
    nullable: true,
  })
  email?: string;

  @Column({
    name: "UBICACION",
    type: "varchar2",
    length: 200,
    nullable: true,
  })
  ubicacion?: string;

  @Column({
    name: "SITIO_WEB_URL",
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  sitioWebUrl?: string;

  @Column({
    name: "REDES_SOCIALES",
    type: "clob",
    nullable: true,
  })
  redesSociales?: string;

  @Column({
    name: "ROL",
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  rol?: string;

  @Column({
    name: "ES_DESTACADO",
    type: "number",
    default: 0,
  })
  esDestacado!: number;

  @Column({
    name: "ORDEN",
    type: "number",
    nullable: true,
  })
  orden?: number;

  @Column({
    name: "IS_ACTIVE",
    type: "number",
    default: 1,
  })
  isActive!: number;

  @Column({
    name: "FECHA_REGISTRO",
    type: "timestamp",
    nullable: true,
  })
  fechaRegistro?: Date;

  @OneToMany(() => Archivos, (archivo) => archivo.expositor)
  archivos?: Archivos[];
}
