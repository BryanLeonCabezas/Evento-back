// src/modules/pagos/mappers/gateway-mapper.interface.ts

import { PagoNormalizado } from "../dto/pago-normalizado.dto.js";

export interface IGatewayResponseMapper {
  mapDebito(raw: any): PagoNormalizado;
  mapReembolso(raw: any, monto: number): PagoNormalizado;
  mapCheckout(transactionId: string, monto: number): PagoNormalizado;
}
