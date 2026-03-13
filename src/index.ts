import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source.js";
import router from "./app.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from "typeorm-transactional";
initializeTransactionalContext();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:8100",
      "http://localhost:4200",
      "http://10.1.60.18:8100",
    ], // Ionic / Angular
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
    const PORT = 3000;

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Error al conectar BD:", err));
