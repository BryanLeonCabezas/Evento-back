import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
  } from "typeorm";
import { EventosUsuarios } from "../eventoUsuario/EventosUsuarios.js";
import { Subsalones } from "../subsalones/Subsalones.entity.js";
import { Salones } from "../salones/Salones.entity.js";

  
  @Index("SYS_C0012867", ["idEvento"], { unique: true })
  @Entity("EVENTOS")
  export class Eventos {
    @Column("number", { primary: true, name: "ID_EVENTO" })
    idEvento: number;
  
    @Column("varchar2", { name: "TITULO", length: 200 })
    titulo: string;
  
    @Column("varchar2", { name: "DESCRIPCION", nullable: true, length: 2000 })
    descripcion: string | null;
  
    @Column("date", { name: "FECHA_EVENTO" })
    fechaEvento: Date;
  
    @Column("date", { name: "HORA_INICIO" })
    horaInicio: Date;
  
    @Column("date", { name: "HORA_FIN" })
    horaFin: Date;
  
    @Column("number", {
      name: "TIEMPO_SETUP_MIN",
      nullable: true,
      default: () => "0",
    })
    tiempoSetupMin: number | null;
  
    @Column("number", {
      name: "TIEMPO_CLEAN_MIN",
      nullable: true,
      default: () => "0",
    })
    tiempoCleanMin: number | null;
  
    @Column("number", { name: "PUBLICO_ESPERADO", nullable: true })
    publicoEsperado: number | null;
  
    @Column("varchar2", { name: "IMAGEN_URL", nullable: true, length: 500 })
    imagenUrl: string | null;
  
    @Column("date", {
      name: "FECHA_REGISTRO",
      nullable: true,
      default: () => "SYSDATE",
    })
    fechaRegistro: Date | null;
  
    @ManyToOne(() => Salones, (salones) => salones.eventos)
    @JoinColumn([{ name: "ID_SALON", referencedColumnName: "idSalon" }])
    idSalon: Salones;
  
    @ManyToOne(() => Subsalones, (subsalones) => subsalones.eventos)
    @JoinColumn([{ name: "ID_SUBSALON", referencedColumnName: "idSubsalon" }])
    idSubsalon: Subsalones;
  
    @OneToMany(
      () => EventosUsuarios,
      (eventosUsuarios) => eventosUsuarios.idEvento
    )
    eventosUsuarios: EventosUsuarios[];
  }
  