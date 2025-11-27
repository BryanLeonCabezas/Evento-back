import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuarios } from "./modules/usuario/Usuario.entity.js";
import { EventosUsuarios } from "./modules/eventoUsuario/EventosUsuarios.js";
import { Eventos } from "./modules/evento/Evento.entity.js";
import { Salones } from "./modules/salones/Salones.entity.js";
import { Subsalones } from "./modules/subsalones/Subsalones.entity.js";
import { Instituciones } from "./modules/instituciones/Instituciones.entity.js";
import { Locales } from "./modules/locales/Locales.entity.js";

export const AppDataSource = new DataSource({
  type: "oracle",
  host: "154.38.187.235",
  port: 1521,
  username: "CONNECT_HUB",
  password: "Dentry2025",
  //database: "postgres",
  serviceName:"XEPDB1",
  synchronize: false,
  logging: false,
  entities: [Usuarios, EventosUsuarios, Eventos, Salones, Subsalones, Instituciones, Locales],
});
