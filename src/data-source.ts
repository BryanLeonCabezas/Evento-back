import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuarios } from "./modules/usuario/entity.js";
import { EventosUsuarios } from "./modules/eventoUsuario/entity.js";
import { Eventos } from "./modules/evento/entity.js";
import { Salones } from "./modules/salones/entity.js";
import { Subsalones } from "./modules/subsalones/entity.js";
import { Instituciones } from "./modules/instituciones/entity.js";
import { Locales } from "./modules/locales/entity.js";
import { UsuarioInstituciones } from "./modules/usuarioIntituciones/entity.js";
import { TarjetasUsuario } from "./modules/tarjetaUsuario/entity.js";

export const AppDataSource = new DataSource({
  type: "oracle",
  host: "154.38.187.235",
  port: 1521,
  username: "CONNECT_HUB",
  password: "Dentry2025",
  //database: "postgres",
  serviceName: "XEPDB1",
  synchronize: false,
  logging: false,
  entities: [
    Usuarios,
    EventosUsuarios,
    Eventos,
    Salones,
    Subsalones,
    Instituciones,
    Locales,
    UsuarioInstituciones,
    TarjetasUsuario
  ],
});
