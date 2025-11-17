import "reflect-metadata";
import { DataSource } from "typeorm";
import { EventosUsuarios } from "./modules/usuario/EventoUsuario.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "postgres",
  synchronize: false,
  logging: false,
  entities: [EventosUsuarios],
});
