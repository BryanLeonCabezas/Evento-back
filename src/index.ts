import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source.js";
import router from "./app.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.use("/api", router)
// Iniciar la conexión a la BD
app.use(errorHandler);
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión a PostgreSQL lista");
  })
  .catch((err) => console.error("Error al conectar BD:", err));

// Puerto
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
