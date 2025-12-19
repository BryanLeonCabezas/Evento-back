import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
  } from "typeorm";
import { Eventos } from "../evento/entity.js";
import { Salones } from "../salones/entity.js";

  
  @Index("SYS_C0012860", ["idSubsalon"], { unique: true })
  @Entity("SUBSALONES")
  export class Subsalones {
    @Column("number", { primary: true, name: "ID_SUBSALON" })
    idSubsalon: number;
  
    @Column("varchar2", { name: "NOMBRE", length: 150 })
    nombre: string;
  
    @Column("number", { name: "CAPACIDAD_MAX", nullable: true })
    capacidadMax: number | null;
  
    @Column("date", {
      name: "FECHA_REGISTRO",
      nullable: true,
      default: () => "SYSDATE",
    })
    fechaRegistro: Date | null;
  
    @OneToMany(() => Eventos, (eventos) => eventos.idSubsalon)
    eventos: Eventos[];
  
    @ManyToOne(() => Salones, (salones) => salones.subsalones)
    @JoinColumn([{ name: "ID_SALON", referencedColumnName: "idSalon" }])
    idSalon: Salones;
  }
  