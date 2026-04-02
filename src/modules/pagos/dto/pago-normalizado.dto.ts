// src/modules/pagos/dto/pago-normalizado.dto.ts

export type TipoPago = "EXITOSO" | "GRATUITO" | "REEMBOLSO" | "FALLIDO";

export interface PagoNormalizado {
  transaccionId: string | null;
  pasarela: string | null;
  estado: string;
  detalleEstado: string | null;
  monto: number;
  moneda: string;
  metodoPago: string | null;
  marcaTarjeta: string | null;
  ultimos4: string | null;
  responseJson: object | null;
  tipo: TipoPago;
}