// src/modules/pagos/mappers/gateway-mapper.interface.ts

import { PagoNormalizado } from "../dto/pago-normalizado.dto.js";

export interface IGatewayResponseMapper {
  mapDebito(raw: any, origen: "DEBITO" | "CHECKOUT"): PagoNormalizado;
  mapReembolso(raw: any, monto: number, origen: "DEBITO" | "CHECKOUT"): PagoNormalizado;
}
