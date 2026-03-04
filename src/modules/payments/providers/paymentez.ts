import axios from "axios";
import crypto from "crypto";
import { PaymentProvider } from "../interface/payment.interface.js";

export class PaymentezProvider implements PaymentProvider {
  private baseUrl =
    process.env.BASE_URL_STG || "https://dashboard-stg.paymentez.com";

  private appCode = process.env.PAYMENTEZ_APP_CODE || "NUVEISTG-EC-CLIENT";
  private appKey =
    process.env.PAYMENTEZ_APP_KEY || "rvpKAv2tc49x6YL38fvtv5jJxRRiPs";

  private generateAuthToken() {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    console.log("Generating auth token with timestamp:", timestamp);
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
    console.log("Listing cards for userId:", userId);
    console.log("Using baseUrl:", this.baseUrl);
    const response = await axios.get(
      `${this.baseUrl}/v2/card/list?uid=${userId}`,
      {
        headers: this.getHeaders(),
      },
    );
    console.log("Response from Paymentez listCards:", response.data);
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
    }
  );

  return response.data;
}

  async debit(data: {
    userId: string;
    cardToken: string;
    amount: number;
    description: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/v2/transaction/debit/`,
      {
        user: {
          id: data.userId,
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
}
