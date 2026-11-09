import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Instituciones } from "../instituciones/entity.js";
import { Salones } from "../salones/entity.js";
import { Archivos } from "../archivos/entity.js";
import { Eventos } from "../evento/entity.js";

@Index("SYS_C0012851", ["idLocal"], { unique: true })
@Entity("LOCALES")
export class Locales {
  @Column("number", { primary: true, name: "ID_LOCAL" })
  idLocal!: number;

  @Column("varchar2", { name: "NOMBRE", length: 150 })
  nombre!: string;

  @Column("varchar2", { name: "UBICACION", nullable: true, length: 250 })
  ubicacion?: string | null;

  @Column("varchar2", { name: "DESCRIPCION", nullable: true, length: 4000 })
  descripcion?: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro?: Date | null;

  @ManyToOne(() => Instituciones, (instituciones) => instituciones.locales)
  @JoinColumn([
    { name: "ID_INSTITUCION", referencedColumnName: "idInstitucion" },
  ])
  idInstitucion?: Instituciones;

  @OneToMany(() => Salones, (salones) => salones.idLocal)
  salones?: Salones[];

  @OneToMany(() => Archivos, (archivo) => archivo.local)
  archivos!: Archivos[];

  @OneToMany(() => Eventos, (evento) => evento.idLocal)
  eventos?: Eventos[];
}
