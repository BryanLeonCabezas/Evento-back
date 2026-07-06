import dotenv from "dotenv";
import { google } from "googleapis";

// Detecta entorno
const NODE_ENV = process.env.NODE_ENV || "development";

// Carga el .env correcto
dotenv.config({
  path: `.env.${NODE_ENV}`,
});

export const env = {
  nodeEnv: NODE_ENV,

  paymentez: {
    baseUrl: process.env.BASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refresh: process.env.JWT_REFRESH_SECRET!,
    qrSecret: process.env.QR_SECRET!,
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    gooogleClientIdIOS: process.env.GOOGLE_CLIENT_ID_IOS!,
    googleClientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID!,
  },

  db: {
    port: process.env.DB_PORT!,
    serviceName: process.env.DB_SERVICE!,
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },

  archivo:{
    rutaArchivos: process.env.RUTA_ARCHIVOS!,
  }
};