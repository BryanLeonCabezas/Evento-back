import multer from "multer";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const BASE_UPLOADS = path.resolve(env.archivo.rutaArchivos || "./uploads");

const tempDir = path.join(BASE_UPLOADS, "temp");

fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); //SIEMPRE TEMP
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const nombre =
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 8) +
      extension;

    cb(null, nombre);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});