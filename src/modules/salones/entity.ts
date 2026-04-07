import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
  } from "typeorm";
import { Subsalones } from "../subsalones/entity.js";
import { Locales } from "../locales/entity.js";
import { Eventos } from "../evento/entity.js";

  
  @Index("SYS_C0012856", ["idSalon"], { unique: true })
  @Entity("SALONES")
  export class Salones {
    @Column("number", { primary: true, name: "ID_SALON" })
    idSalon!: number;
  
    @Column("varchar2", { name: "NOMBRE", length: 150 })
    nombre!: string;
  
    @Column("char", {
      name: "ES_SUBDIVISIBLE",
      nullable: true,
      length: 1,
      default: () => "'N'",
    })
    esSubdivisible?: string | null;
  
    @Column("number", { name: "CAPACIDAD_MAX", nullable: true })
    capacidadMax?: number | null;
  
    @Column("date", {
      name: "FECHA_REGISTRO",
      nullable: true,
      default: () => "SYSDATE",
    })
    fechaRegistro?: Date | null;
  
    @OneToMany(() => Eventos, (eventos) => eventos.idSalon)
    eventos?: Eventos[];
  
    @ManyToOne(() => Locales, (locales) => locales.salones)
    @JoinColumn([{ name: "ID_LOCAL", referencedColumnName: "idLocal" }])
    idLocal?: Locales;
  
    @OneToMany(() => Subsalones, (subsalones) => subsalones.idSalon)
    subsalones?: Subsalones[];
  }
  