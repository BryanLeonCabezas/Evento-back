import { PaymentProvider } from "./interface/payment.interface.js";
import { PaymentezProvider } from "./providers/paymentez.js";


export class PaymentsService {
  private provider: PaymentProvider | undefined;

  constructor(providerType: "paymentez" | "paypal" = "paymentez") {
    // Aquí puedes cambiar proveedor fácilmente
    if (providerType === "paymentez") {
      this.provider = new PaymentezProvider();
    }

    // En el futuro:
    // if (providerType === "paypal") {
    //   this.provider = new PaypalProvider();
    // }
  }

  async listarTarjetas(userId: string) {
    return this.provider?.listCards?.(userId);
  }

  async eliminarTarjeta(userId: string, token: string) {
    return this.provider?.deleteCard?.(userId, token);
  }

  async debitar(data: {
    userId: string;
    amount: number;
    description: string;
    cardToken?: string;
  }) {
    return this.provider?.debit(data);
  }
}