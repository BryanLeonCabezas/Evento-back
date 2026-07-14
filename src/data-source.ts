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
import { Pagos } from "./modules/pagos/entity.js";
import { Archivos } from "./modules/archivos/entity.js";
import { EventoExpositores } from "./modules/eventoExpositores/entity.js";
import { env } from "./config/env.js";

export const AppDataSource = new DataSource({
  type: "oracle",
  host: env.db.host,
  port: Number(env.db.port),
  username: env.db.user,
  password: env.db.password,
  serviceName: env.db.serviceName,
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
    Pagos,
    Archivos,
    EventoExpositores,
  ],
});
