import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { Eventos } from "../evento/entity.js";
import { Instituciones } from "../instituciones/entity.js";
import { Locales } from "../locales/entity.js";
import { Salones } from "../salones/entity.js";
import { Subsalones } from "../subsalones/entity.js";
import { EventoExpositores } from "../eventoExpositores/entity.js";
import { Usuarios } from "../usuario/entity.js";
import { Certificado } from "../certificados/entity.js";

@Entity("ARCHIVOS")
export class Archivos {
  /* ================= PK ================= */

  @PrimaryGeneratedColumn({
    name: "ID_ARCHIVO",
    type: "number",
  })
  idArchivo!: number;

  /* ================= TIPO ENTIDAD ================= */

  @Column({
    name: "TIPO_ENTIDAD",
    type: "varchar2",
    length: 20,
    nullable: false,
  })
  tipoEntidad!:
    | "EVENTO"
    | "INSTITUCION"
    | "LOCAL"
    | "SALON"
    | "SUBSALON"
    | "CONFIGURACION"
    | "EXPOSITOR"
    | "USUARIO"
    | "CERTIFICADO";

  /* ================= RELACIONES ================= */

  @ManyToOne(() => Eventos, (evento) => evento.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_EVENTO",
    referencedColumnName: "idEvento",
  })
  evento?: Eventos;

  @ManyToOne(() => Instituciones, (institucion) => institucion.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_INSTITUCION",
    referencedColumnName: "idInstitucion",
  })
  institucion?: Instituciones;

  @ManyToOne(() => Locales, (local) => local.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_LOCAL",
    referencedColumnName: "idLocal",
  })
  local?: Locales;

  @ManyToOne(() => Salones, (salon) => salon.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_SALON",
    referencedColumnName: "idSalon",
  })
  salon?: Salones;

  @ManyToOne(() => Subsalones, (subsalon) => subsalon.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_SUBSALON",
    referencedColumnName: "idSubsalon",
  })
  subsalon?: Subsalones;

  @Column({
    name: "ID_CONFIGURACION",
    type: "number",
    nullable: true,
  })
  idConfiguracion?: number;

  @ManyToOne(() => EventoExpositores, (expositor) => expositor.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_EXPOSITOR",
    referencedColumnName: "idExpositor",
  })
  expositor?: EventoExpositores;

  @ManyToOne(() => Usuarios, (usuario) => usuario.archivos, {
    nullable: true,
  })
  @JoinColumn({
    name: "ID_USUARIO",
    referencedColumnName: "idCliente",
  })
  usuario?: Usuarios;

  @ManyToOne(() => Certificado, (certificado) => certificado.archivos)
  @JoinColumn({
    name: "ID_CERTIFICADO",
  })
  certificado?: Certificado;
  /* ================= ARCHIVO ================= */

  @Column({
    name: "TIPO_ARCHIVO",
    type: "varchar2",
    length: 30,
    nullable: false,
  })
  tipoArchivo!:
    | "PORTADA"
    | "GALERIA"
    | "LOGO"
    | "BANNER"
    | "DOCUMENTO"
    | "CROQUIS"
    | "LOGO"
    | "PERFIL";

  @Column({
    name: "NOMBRE_ORIGINAL",
    type: "varchar2",
    length: 255,
    nullable: false,
  })
  nombreOriginal!: string;

  @Column({
    name: "NOMBRE_FISICO",
    type: "varchar2",
    length: 255,
    nullable: false,
  })
  nombreFisico!: string;

  @Column({
    name: "MIME_TYPE",
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  mimeType?: string;

  @Column({
    name: "TAMANIO_BYTES",
    type: "number",
    nullable: true,
  })
  tamanioBytes?: number;

  @Column({
    name: "URL_ARCHIVO",
    type: "varchar2",
    length: 1000,
    nullable: false,
  })
  urlArchivo!: string;

  /* ================= CONTROL ================= */

  @Column({
    name: "ACTIVO",
    type: "char",
    length: 1,
    default: "S",
    nullable: false,
  })
  activo!: "S" | "N";

  /* ================= FECHAS ================= */

  @CreateDateColumn({
    name: "FECHA_REGISTRO",
    type: "timestamp",
  })
  fechaRegistro?: Date;
}
