import crypto from "crypto";
import { env } from "../../config/env.js";

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
};

export const comparePassword = (password: string, storedHash: string) => {
  const [salt, originalHash] = storedHash.split(":");

  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === originalHash;
};

export const generateQrHash = (qrToken: string) => {
  return crypto
    .createHmac("sha256", env.jwt.qrSecret!)
    .update(qrToken)
    .digest("hex");
};

export const generarCodigoQR = (prefijo = "TCK") => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 8;

  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }

  return `${prefijo}-${token.slice(0, 4)}-${token.slice(4)}`;
};

export const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, hashedToken };
};

// Hashea cualquier token recibido
export const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

