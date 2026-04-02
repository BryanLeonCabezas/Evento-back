// src/modules/pagos/mappers/gateway-mapper.factory.ts

import { PaymentProviderEnum } from "../../../common/enums/paymentProvider.enum.js";
import { IGatewayResponseMapper } from "./gateway-mapper.interface.js";
import { PaymentezMapper } from "./paymentez.mapper.js";

export class GatewayMapperFactory {
  static create(pasarela: string): IGatewayResponseMapper {
    switch (pasarela.toLowerCase()) {
      case PaymentProviderEnum.PAYMENTEZ:
        return new PaymentezMapper();
      // case "stripe":
      //   return new StripeMapper();
      default:
        throw new Error(`Mapper no disponible para pasarela: ${pasarela}`);
    }
  }
}