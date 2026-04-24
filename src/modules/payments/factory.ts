// payment.factory.ts
import { PaymentProviderEnum } from "../../common/enums/paymentProvider.enum.js";
import { PaymentProvider } from "./interface/payment.interface.js";
import { PaymentezProvider } from "./providers/paymentez.js";
// import { PaypalProvider } from "./providers/paypal.js";

type ProviderType = "paymentez" | "paypal";

export class PaymentProviderFactory {
  static create(institucion: {
    PROVEEDOR_PAGO: string;
    CODIGO_CONEXION?: string;
    USUARIO_PASARELA?: string;
    CONTRASENA_PASARELA?: string;
    TOKEN_PASARELA?: string;
    APP_CODE_CHECKOUT?: string;
    APP_KEY_CHECKOUT?: string;
  }): PaymentProvider {
    switch (institucion.PROVEEDOR_PAGO) {
      case PaymentProviderEnum.PAYMENTEZ:
        return new PaymentezProvider({
          appCode: institucion.USUARIO_PASARELA!,
          appKey: institucion.CONTRASENA_PASARELA!,
          appCodeCheckout: institucion.APP_CODE_CHECKOUT!,
          appKeyCheckout: institucion.APP_KEY_CHECKOUT!,
        });
      // case "paypal":
      //   return new PaypalProvider();
      default:
        throw new Error(
          `Proveedor de pago no soportado: ${institucion.PROVEEDOR_PAGO}`,
        );
    }
  }
}
