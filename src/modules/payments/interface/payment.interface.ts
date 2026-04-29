export interface PaymentProvider {
  listCards?(userId: string): Promise<any>;

  deleteCard?(userId: string, cardToken: string): Promise<any>;

  debit(data: {
    userId: string;
    amount: number;
    description: string;
    cardToken?: string;
    email: string;
    devReference: string;
  }): Promise<any>;

  refund?(data: {
    // ← opcional, no todos los proveedores lo soportan
    transactionId: string;
    amount: number;
    moreInfo?: boolean;
  }): Promise<any>;

  initReference(data: {
    locale: string;
    userId: string;
    userEmail: string;
    amount: number;
    description: string;
    devReference: string;
    vat?: number;
    installmentsType?: number;
    tax_percentage?: 0;
    taxable_amount?: 0;
  }): Promise<any>;
}
