export interface PaymentProvider {
  listCards?(userId: string): Promise<any>;

  deleteCard?(userId: string, cardToken: string): Promise<any>;

  debit(data: {
    userId: string;
    amount: number;
    description: string;
    cardToken?: string;
  }): Promise<any>;

  refund?(data: {          // ← opcional, no todos los proveedores lo soportan
    transactionId: string;
    amount: number;
    moreInfo?: boolean;
  }): Promise<any>;
}