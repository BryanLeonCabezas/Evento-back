@Entity("TARJETAS_USUARIO")
@Index("UK_CARD_USER_TOKEN", ["usuario", "cardToken"], { unique: true })
export class TarjetasUsuario {
  @PrimaryGeneratedColumn({ name: "ID_TARJETA", type: "number" })
  idTarjeta: number;

  @ManyToOne(() => Usuarios, (usuario) => usuario.tarjetas, { nullable: false })
  @JoinColumn({ name: "USER_ID", referencedColumnName: "idCliente" })
  usuario: Usuarios;

  @Column("varchar2", { name: "CARD_TOKEN", length: 200 })
  cardToken: string;

  @Column("varchar2", { name: "LAST4", length: 4 })
  last4: string;

  @Column("varchar2", { name: "BRAND", length: 10 })
  brand: string;

  @Column("number", { name: "EXPIRY_MONTH", precision: 2 })
  expiryMonth: number;

  @Column("number", { name: "EXPIRY_YEAR", precision: 4 })
  expiryYear: number;

  @Column("varchar2", { name: "STATUS", length: 20, default: () => "'ACTIVE'" })
  status: string;

  @Column("date", { name: "CREATED_AT", default: () => "SYSDATE" })
  createdAt: Date;

  @Column("date", { name: "DELETED_AT", nullable: true })
  deletedAt: Date | null;
}
