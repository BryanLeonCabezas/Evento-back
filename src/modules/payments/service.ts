import { PaymentProvider } from "./interface/payment.interface.js";
import { PaymentezProvider } from "./providers/paymentez.js";


export class PaymentsService {


  constructor(private readonly provider: PaymentProvider) {

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
    email: string;
  }) {
    return this.provider?.debit(data);
  }

   async reembolsar(data: {
    transactionId: string;
    amount: number;
    moreInfo?: boolean;
  }) {
    if (!this.provider.refund) {
      throw new Error("El proveedor actual no soporta reembolsos");
    }
    return this.provider.refund(data);
  }
}