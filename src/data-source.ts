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
import { EntradasEvento } from "./modules/entradaEvento/entity.js";
export const AppDataSource = new DataSource({
  type: "oracle",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  serviceName: process.env.DB_SERVICE,
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
    TarjetasUsuario,
    EntradasEvento,
  ],
});
