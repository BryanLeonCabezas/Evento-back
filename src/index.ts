import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import { AppDataSource } from "./data-source.js";
import router from "./app.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from "typeorm-transactional";
initializeTransactionalContext();
const app = express();

const sslOptions = {
  key: fs.readFileSync("C:\\ssl\\private.key"),
  cert: fs.readFileSync("C:\\ssl\\certificate.crt"),
  ca: fs.readFileSync("C:\\ssl\\ca_bundle.crt"),
};


app.use(
  cors({
    // origin: [
    //   "http://localhost:8100",
    //   "http://localhost:4200",
    //   "http://10.1.60.18:8100",
    //   "*"
    // ], // Ionic / Angular
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", router);
// Iniciar la conexión a la BD
app.use(errorHandler);
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión a PostgreSQL lista");
    addTransactionalDataSource(AppDataSource);


    // Puerto
    const HTTP_PORT = 3000;   // opcional
    const HTTPS_PORT = 3443;

    const server = https.createServer(sslOptions, app);
    /*app.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });*/

    server.listen(HTTPS_PORT, () => {
      console.log(
        `Servidor HTTPS en https://localhost:${HTTPS_PORT}/api`
      );
    });
  })
  .catch((err) => console.error("Error al conectar BD:", err));
