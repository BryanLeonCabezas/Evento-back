import { Column, Entity, Index, OneToMany } from "typeorm";
import { Locales } from "../locales/Locales.entity.js";


@Index("SYS_C0012848", ["idInstitucion"], { unique: true })
@Entity("INSTITUCIONES")
export class Instituciones {
  @Column("number", { primary: true, name: "ID_INSTITUCION" })
  idInstitucion: number;

  @Column("varchar2", { name: "NOMBRE", length: 150 })
  nombre: string;

  @Column("varchar2", { name: "DIRECCION", nullable: true, length: 250 })
  direccion: string | null;

  @Column("varchar2", { name: "CIUDAD", nullable: true, length: 100 })
  ciudad: string | null;

  @Column("varchar2", { name: "PAIS", nullable: true, length: 100 })
  pais: string | null;

  @Column("date", {
    name: "FECHA_REGISTRO",
    nullable: true,
    default: () => "SYSDATE",
  })
  fechaRegistro: Date | null;

  @OneToMany(() => Locales, (locales) => locales.idInstitucion)
  locales: Locales[];
}
