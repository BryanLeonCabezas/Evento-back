import crypto from "crypto";

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
 return crypto.createHmac("sha256", process.env.QR_SECRET!)
    .update(qrToken)
    .digest("hex");
}
