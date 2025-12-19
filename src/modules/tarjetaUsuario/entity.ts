import {
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { Usuarios } from "../usuario/entity.js";
  
  @Entity("TARJETAS_USUARIO")
  @Index("UK_CARD_TOKEN", ["cardToken"], { unique: true })
  export class TarjetasUsuario {
  
    @PrimaryGeneratedColumn({
      name: "ID_TARJETA",
      type: "number",
    })
    idTarjeta: number;
  
    @Column("varchar2", {
      name: "USER_ID",
      length: 50,
      nullable: false,
    })
    userId: string;
  
    @Column("varchar2", {
      name: "CARD_TOKEN",
      length: 40,
      nullable: false,
    })
    cardToken: string;
  
    @Column("varchar2", {
      name: "LAST4",
      length: 4,
      nullable: false,
    })
    last4: string;
  
    @Column("varchar2", {
      name: "BRAND",
      length: 10,
      nullable: false,
    })
    brand: string;
  
    @Column("varchar2", {
      name: "EXPIRY_MONTH",
      length: 2,
      nullable: false,
    })
    expiryMonth: string;
  
    @Column("varchar2", {
      name: "EXPIRY_YEAR",
      length: 4,
      nullable: false,
    })
    expiryYear: string;
  
    @Column("varchar2", {
      name: "STATUS",
      length: 20,
      default: () => "'ACTIVE'",
    })
    status: string;
  
    @Column("date", {
      name: "CREATED_AT",
      default: () => "SYSDATE",
    })
    createdAt: Date;
  
    @Column("date", {
      name: "DELETED_AT",
      nullable: true,
    })
    deletedAt: Date | null;
  
    @ManyToOne(() => Usuarios, (usuario) => usuario.tarjetas)
    @JoinColumn({ name: "USER_ID", referencedColumnName: "idCliente" })
    usuario: Usuarios;
  }
  