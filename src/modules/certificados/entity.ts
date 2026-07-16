import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Usuarios } from "../usuario/entity.js";
import { Eventos } from "../evento/entity.js";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { Archivos } from "../archivos/entity.js";

@Entity("CERTIFICADOS")
export class Certificado {

  @PrimaryGeneratedColumn({
    type: "number",
    name: "ID_CERTIFICADO",
  })
  idCertificado!: number;

  @ManyToOne(() => Usuarios, (usuario) => usuario.certificados)
  @JoinColumn({ name: "ID_CLIENTE" })
  usuario!: Usuarios;

  @ManyToOne(() => Eventos, (evento) => evento.certificados)
  @JoinColumn({ name: "ID_EVENTO" })
  evento!: Eventos;

  @ManyToOne(() => EventosUsuarios, (eu) => eu.certificados, {
    nullable: true,
  })
  @JoinColumn({ name: "ID_EVENTO_USUARIO" })
  eventoUsuario?: EventosUsuarios;

  @Column("varchar2", {
    name: "CODIGO",
    length: 40,
  })
  codigo!: string;

  @Column("varchar2", {
    name: "TIPO",
    nullable: true,
    length: 30,
  })
  tipo?: string;

  @Column("varchar2", {
    name: "NOMBRE_ASISTENTE",
    nullable: true,
    length: 200,
  })
  nombreAsistente?: string;

  @Column("varchar2", {
    name: "TITULO_EVENTO",
    nullable: true,
    length: 300,
  })
  tituloEvento?: string;

  @Column("varchar2", {
    name: "INSTITUCION",
    nullable: true,
    length: 200,
  })
  institucion?: string;

  @Column("timestamp", {
    name: "FECHA_EMISION",
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaEmision!: Date;

  @Column("varchar2", {
    name: "ESTADO",
    length: 20,
    default: () => "'EMITIDO'",
  })
  estado!: string;

  @OneToMany(() => Archivos, (archivo) => archivo.certificado)
  archivos?: Archivos[];
}