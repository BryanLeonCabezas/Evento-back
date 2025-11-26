import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuarios } from "./modules/usuario/Usuario.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [Usuarios],
});
