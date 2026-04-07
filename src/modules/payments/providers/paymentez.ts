import axios from "axios";
import crypto from "crypto";
import { PaymentProvider } from "../interface/payment.interface.js";
import { env } from "../../../config/env.js";
import e from "express";

export class PaymentezProvider implements PaymentProvider {
  private appCode: string;
  private appKey: string;
  private baseUrl = env.paymentez.baseUrl;

  constructor(credentials: { appCode: string; appKey: string }) {
    this.appCode = credentials?.appCode;
    this.appKey = credentials?.appKey;
  }


  private generateAuthToken() {
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
  }

  private getHeaders() {
    return {
      "Auth-Token": this.generateAuthToken(),
      "Content-Type": "application/json",
    };
  }

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
          dev_reference: `ORDER-${Date.now()}`,
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
}
