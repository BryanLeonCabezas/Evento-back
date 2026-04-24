import { PagoNormalizado } from "../dto/pago-normalizado.dto.js";
import { IGatewayResponseMapper } from "./gateway-mapper.interface.js";

// paymentez.mapper.ts
export class PaymentezMapper implements IGatewayResponseMapper {
  mapDebito(responsePago: any): PagoNormalizado {
    const { card, transaction } = responsePago;

    const exitoso =
      transaction?.status === "success" &&
      transaction?.current_status === "APPROVED";

    return {
      transaccionId: transaction?.id ?? null,
      pasarela: "paymentez",
      estado: transaction?.current_status ?? "UNKNOWN",
      detalleEstado: transaction?.message ?? null,
      monto: transaction?.amount ?? 0,
      moneda: "USD",
      metodoPago: transaction?.payment_method_type ?? null,
      marcaTarjeta: card?.type ?? null, // "vi"
      ultimos4: card?.number ?? null, // "1111"
      responseJson: responsePago,
      tipo: exitoso ? "EXITOSO" : "FALLIDO",
    };
  }

  mapReembolso(responseReembolso: any, monto: number): PagoNormalizado {
    const { transaction } = responseReembolso;

    return {
      transaccionId: transaction?.id ?? null,
      pasarela: "paymentez",
      estado: transaction?.current_status ?? "REFUNDED",
      detalleEstado: transaction?.message ?? null,
      monto: monto,
      moneda: "USD",
      metodoPago: null,
      marcaTarjeta: null,
      ultimos4: null,
      responseJson: responseReembolso,
      tipo: "REEMBOLSO",
    };
  }

  mapCheckout(transactionId: string, monto: number): PagoNormalizado {
    return {
      transaccionId: transactionId,
      pasarela: "paymentez",
      estado: "APROBADO",
      detalleEstado: "Pago por checkout",
      monto,
      moneda: "USD",
      metodoPago: "CHECKOUT",
      marcaTarjeta: null,
      ultimos4: null,
      responseJson: { transactionId, source: "checkout" },
      tipo: "EXITOSO",
    };
  }
}
