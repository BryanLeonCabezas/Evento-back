import axios from "axios";
import crypto from "crypto";
import { PaymentProvider } from "../interface/payment.interface.js";
import { env } from "../../../config/env.js";
import e from "express";

export class PaymentezProvider implements PaymentProvider {
  private appCode: string;
  private appKey: string;
  private appCodeCheckout: string;
  private appKeyCheckout: string;
  private baseUrl = env.paymentez.baseUrl;

  constructor(credentials: {
    appCode: string;
    appKey: string;
    appCodeCheckout: string;
    appKeyCheckout: string;
  }) {
    this.appCode = credentials?.appCode;
    this.appKey = credentials?.appKey;
    this.appCodeCheckout = credentials.appCodeCheckout;
    this.appKeyCheckout = credentials.appKeyCheckout;

  }

  /*private generateAuthToken() {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const uniqTokenString = this.appKey + timestamp;

    const uniqTokenHash = crypto
      .createHash("sha256")
      .update(uniqTokenString)
      .digest("hex");

    const authToken = Buffer.from(
      `${this.appCode};${timestamp};${uniqTokenHash}`,
    ).toString("base64");

    return authToken;
  }*/

  private generateAuthToken(appCode: string, appKey: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const hash = crypto
      .createHash("sha256")
      .update(appKey + timestamp)
      .digest("hex");
    return Buffer.from(`${appCode};${timestamp};${hash}`).toString("base64");
  }

  private getHeaders(type: "server" | "checkout" = "server") {
    const appCode = type === "checkout" ? this.appCodeCheckout : this.appCode;
    const appKey = type === "checkout" ? this.appKeyCheckout : this.appKey;
    return {
      "Auth-Token": this.generateAuthToken(appCode, appKey),
      "Content-Type": "application/json",
    };
  }

  /* private getHeaders() {
    return {
      "Auth-Token": this.generateAuthToken(),
      "Content-Type": "application/json",
    };
  }*/

  async listCards(userId: string) {
    const response = await axios.get(
      `${this.baseUrl}/v2/card/list?uid=${userId}`,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data;
  }

  async deleteCard(userId: string, cardToken: string) {
    const response = await axios.post(
      `${this.baseUrl}/v2/card/delete`,
      {
        user: { id: userId },
        card: { token: cardToken },
      },
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async debit(data: {
    userId: string;
    cardToken: string;
    amount: number;
    description: string;
    email: string;
    devReference: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/v2/transaction/debit/`,
      {
        user: {
          id: data.userId,
          email: data.email,
        },
        order: {
          amount: data.amount,
          description: data.description,
          dev_reference: data.devReference,
          vat: 0,
          tax_percentage: 0,
        },
        card: {
          token: data.cardToken,
        },
      },
      { headers: this.getHeaders() },
    );

    return response.data;
  }

  async refund(data: {
    transactionId: string;
    amount?: number;
    moreInfo?: boolean;
  }) {
    const body: any = {
      transaction: {
        id: data.transactionId,
      },
    };

    if (data.amount !== undefined) {
      body.order = {
        amount: parseFloat(data.amount.toFixed(2)),
      };
    }

    if (data.moreInfo !== undefined) {
      body.more_info = data.moreInfo;
    }

    const response = await axios.post(
      `${this.baseUrl}/v2/transaction/refund/`,
      body,
      { headers: this.getHeaders() },
    );

    return response.data;
  }

  async initReference(data: {
    locale: string;
    userId: string;
    userEmail: string;
    amount: number;
    description: string;
    devReference: string;
    vat?: number;
    installmentsType?: number;
    tax_percentage?: number;
    taxable_amount?: number;
  }): Promise<{ reference: string; checkout_url: string }> {
   
    const body = {
      locale: data.locale,
      order: {
        amount: parseFloat(Number(data.amount ?? 0).toFixed(2)),
        description: data.description,
        dev_reference: data.devReference,
        tax_percentage: data.tax_percentage ?? 0,
        taxable_amount: data.taxable_amount ?? 0,
        vat: data.vat ?? 0,
        installments_type: data.installmentsType ?? 0,
      },
      user: {
        id: data.userId,
        email: data.userEmail,
      },
      conf: {
        theme: {
          primary_color: "#0f6675",
          secondary_color: "#1b3d5e",
        },
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/v2/transaction/init_reference/`,
      body,
      { headers: this.getHeaders("checkout") },
    );
    return response.data;

    // { reference: string, checkout_url: string }
  }
}
