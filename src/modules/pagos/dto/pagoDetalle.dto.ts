export interface PagoDetalleResponseDto {
  idPago: number;
  transaccionId: string | null;
  pasarela: string | null;
  estado: string | null;      
  tipoPago: string;           
  monto: number;
  moneda: string;
  esGratis: boolean;
  marcaTarjeta: string | null;
  ultimos4: string | null;
  fechaPago: Date | null;
  fechaRegistro: Date;
}