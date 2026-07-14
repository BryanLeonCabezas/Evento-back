import { Archivos } from "./entity.js";
import { archivosRepository } from "./repository.js";
import { eventoRepository } from "../evento/repository.js";
import { institucionRepository } from "../instituciones/repository.js";
import { localesReposiroty } from "../locales/reposiroty.js";
import { CrearArchivoDto } from "./dto/crearArchivo.dto.js";
import path from "path";
import fs from "fs";
import { env } from "../../config/env.js";
import { salonRepository } from "../salones/repository.js";
import { subsalonesReposiroty } from "../subsalones/repository.js";
import { eventoExpositoresRepository } from "../eventoExpositores/repositoy.js";

export class ArchivosService {
  private archivosRepository = archivosRepository;

  async guardarArchivo(
    dto: CrearArchivoDto,
    file: Express.Multer.File,
  ): Promise<Archivos> {
    await this.validarEntidad(dto);
    this.validarTipoArchivo(dto);

    const rutaFinal = this.moverArchivo(file, dto);

    const existenteActivo = await this.buscarActivo(dto);

    if (existenteActivo) {
      existenteActivo.activo = "N";
      await this.archivosRepository.save(existenteActivo);
    }

    const archivo = this.archivosRepository.create({
      tipoEntidad: dto.tipoEntidad,
      tipoArchivo: dto.tipoArchivo,

      nombreOriginal: file.originalname,
      nombreFisico: file.filename,
      mimeType: file.mimetype,
      tamanioBytes: file.size,
      urlArchivo: rutaFinal,

      activo: "S",
    });

    switch (dto.tipoEntidad) {
      case "EVENTO":
        archivo.evento = await eventoRepository.findOneByOrFail({
          idEvento: dto.idEvento!,
        });
        break;

      case "INSTITUCION":
        archivo.institucion = await institucionRepository.findOneByOrFail({
          idInstitucion: dto.idInstitucion!,
        });
        break;

      case "LOCAL":
        archivo.local = await localesReposiroty.findOneByOrFail({
          idLocal: dto.idLocal!,
        });
        break;
      case "SALON":
        archivo.salon = await salonRepository.findOneByOrFail({
          idSalon: dto.idSalon!,
        });
        break;

      case "SUBSALON":
        archivo.subsalon = await subsalonesReposiroty.findOneByOrFail({
          idSubsalon: dto.idSubsalon!,
        });
        break;

      case "EXPOSITOR":
        archivo.expositor = await eventoExpositoresRepository.findOneByOrFail({
          idExpositor: dto.idExpositor!,
        });
        break;

      case "CONFIGURACION":
        archivo.idConfiguracion = dto.idConfiguracion!;
        break;
    }

    return await this.archivosRepository.save(archivo);
  }

  async obtenerActivo(params: {
    tipoEntidad:
      | "EVENTO"
      | "INSTITUCION"
      | "LOCAL"
      | "SALON"
      | "SUBSALON"
      | "CONFIGURACION"
      | "EXPOSITOR";
    id: number;
    tipoArchivo: string;
  }): Promise<Archivos | null> {
    return this.archivosRepository.findOne({
      where: {
        tipoEntidad: params.tipoEntidad,
        tipoArchivo: params.tipoArchivo as any,
        activo: "S",

        ...(params.tipoEntidad === "EVENTO" && {
          evento: { idEvento: params.id },
        }),

        ...(params.tipoEntidad === "INSTITUCION" && {
          institucion: { idInstitucion: params.id },
        }),

        ...(params.tipoEntidad === "LOCAL" && {
          local: { idLocal: params.id },
        }),
        ...(params.tipoEntidad === "SALON" && {
          salon: { idSalon: params.id },
        }),

        ...(params.tipoEntidad === "SUBSALON" && {
          subsalon: { idSubsalon: params.id },
        }),

        ...(params.tipoEntidad === "CONFIGURACION" && {
          idConfiguracion: params.id,
        }),
        ...(params.tipoEntidad === "EXPOSITOR" && {
          expositor: { idExpositor: params.id },
        }),
      },
    });
  }

  async obtenerArchivo(idArchivo: number): Promise<Archivos> {
    const archivo = await this.archivosRepository.findOne({
      where: {
        idArchivo,
      },
      relations: {
        evento: true,
        institucion: true,
        local: true,
      },
    });

    if (!archivo) {
      throw new Error("Archivo no encontrado.");
    }

    return archivo;
  }

  private async validarEntidad(dto: CrearArchivoDto) {
    switch (dto.tipoEntidad) {
      case "EVENTO":
        if (!dto.idEvento) throw new Error("Debe enviar el idEvento.");

        if (
          !(await eventoRepository.exists({
            where: { idEvento: dto.idEvento },
          }))
        ) {
          throw new Error("El evento no existe.");
        }

        break;

      case "INSTITUCION":
        if (!dto.idInstitucion)
          throw new Error("Debe enviar el idInstitucion.");

        if (
          !(await institucionRepository.exists({
            where: { idInstitucion: dto.idInstitucion },
          }))
        ) {
          throw new Error("La institución no existe.");
        }

        break;

      case "LOCAL":
        if (!dto.idLocal) throw new Error("Debe enviar el idLocal.");

        if (
          !(await localesReposiroty.exists({
            where: { idLocal: dto.idLocal },
          }))
        ) {
          throw new Error("El local no existe.");
        }

        break;

      case "SALON":
        console.log("dto.idSalon", dto.idSalon);
        if (!dto.idSalon) throw new Error("Debe enviar el idSalon.");

        if (
          !(await salonRepository.exists({
            where: { idSalon: dto.idSalon },
          }))
        ) {
          throw new Error("El salón no existe.");
        }

        break;

      case "SUBSALON":
        if (!dto.idSubsalon) throw new Error("Debe enviar el idSubsalon.");

        if (
          !(await subsalonesReposiroty.exists({
            where: { idSubsalon: dto.idSubsalon },
          }))
        ) {
          throw new Error("El subsalón no existe.");
        }

        break;

      case "EXPOSITOR":
        if (!dto.idExpositor) throw new Error("Debe enviar el idExpositor.");

        if (
          !(await eventoExpositoresRepository.exists({
            where: { idExpositor: dto.idExpositor },
          }))
        ) {
          throw new Error("El expositor no existe.");
        }
        break;

      case "CONFIGURACION":
        if (!dto.idConfiguracion)
          throw new Error("Debe enviar el idConfiguracion.");

      // No se valida contra la BD.

      default:
        throw new Error("Tipo de entidad inválido.");
    }
  }

  private validarTipoArchivo(dto: CrearArchivoDto) {
    const tiposPermitidos = {
      EVENTO: ["PORTADA", "GALERIA", "BANNER", "DOCUMENTO", "CROQUIS", "LOGO"],
      INSTITUCION: [
        "PORTADA",
        "GALERIA",
        "BANNER",
        "DOCUMENTO",
        "CROQUIS",
        "LOGO",
      ],
      LOCAL: ["PORTADA", "GALERIA", "BANNER", "DOCUMENTO", "CROQUIS", "LOGO"],
      SALON: ["PORTADA", "GALERIA", "BANNER", "DOCUMENTO", "CROQUIS", "LOGO"],
      SUBSALON: [
        "PORTADA",
        "GALERIA",
        "BANNER",
        "DOCUMENTO",
        "CROQUIS",
        "LOGO",
      ],
      CONFIGURACION: [
        "PORTADA",
        "GALERIA",
        "BANNER",
        "DOCUMENTO",
        "CROQUIS",
        "LOGO",
      ],
      EXPOSITOR: [
        "PORTADA",
        "GALERIA",
        "BANNER",
        "DOCUMENTO",
        "CROQUIS",
        "LOGO",
      ],
    };

    if (!tiposPermitidos[dto.tipoEntidad]?.includes(dto.tipoArchivo)) {
      throw new Error(
        `El tipo de archivo '${dto.tipoArchivo}' no es válido para '${dto.tipoEntidad}'.`,
      );
    }
  }

  private moverArchivo(file: Express.Multer.File, dto: CrearArchivoDto) {
    const BASE = path.resolve(env.archivo.rutaArchivos);

    let destino = "";

    switch (dto.tipoEntidad) {
      case "EVENTO":
        destino = path.join(BASE, "eventos", String(dto.idEvento));
        break;

      case "INSTITUCION":
        destino = path.join(BASE, "instituciones", String(dto.idInstitucion));
        break;

      case "LOCAL":
        destino = path.join(BASE, "locales", String(dto.idLocal));
        break;
      case "SALON":
        destino = path.join(BASE, "salones", String(dto.idSalon));
        break;

      case "SUBSALON":
        destino = path.join(BASE, "subsalones", String(dto.idSubsalon));
        break;

      case "CONFIGURACION":
        destino = path.join(
          BASE,
          "configuraciones",
          String(dto.idConfiguracion),
        );
        break;
      case "EXPOSITOR":
        destino = path.join(BASE, "expositores", String(dto.idExpositor));
        break;
    }

    fs.mkdirSync(destino, { recursive: true });

    const nuevoPath = path.join(destino, file.filename);

    fs.renameSync(file.path, nuevoPath);

    return nuevoPath.replace(/\\/g, "/");
  }

  private async buscarActivo(dto: CrearArchivoDto) {
    return this.archivosRepository.findOne({
      where: {
        tipoEntidad: dto.tipoEntidad,
        tipoArchivo: dto.tipoArchivo,
        activo: "S",

        ...(dto.tipoEntidad === "EVENTO" && {
          evento: { idEvento: dto.idEvento },
        }),

        ...(dto.tipoEntidad === "INSTITUCION" && {
          institucion: { idInstitucion: dto.idInstitucion },
        }),

        ...(dto.tipoEntidad === "LOCAL" && {
          local: { idLocal: dto.idLocal },
        }),

        ...(dto.tipoEntidad === "SALON" && {
          salon: {
            idSalon: dto.idSalon,
          },
        }),

        ...(dto.tipoEntidad === "SUBSALON" && {
          subsalon: {
            idSubsalon: dto.idSubsalon,
          },
        }),

        ...(dto.tipoEntidad === "CONFIGURACION" && {
          idConfiguracion: dto.idConfiguracion,
        }),
        ...(dto.tipoEntidad === "EXPOSITOR" && {
          expositor: {
            idExpositor: dto.idExpositor,
          },
        }),
      },
    });
  }
}
