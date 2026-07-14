import { Request, Response } from "express";
import { ArchivosService } from "./service.js";
import { CrearArchivoDto } from "./dto/crearArchivo.dto.js";
import fs from "fs";

export class ArchivosController {
  constructor(private readonly archivosService: ArchivosService) {}

  guardarArchivo = async (req: Request, res: Response) => {

    try {
      if (!req.file) {
        return res.status(400).json({
          mensaje: "Debe enviar un archivo.",
        });
      }

      const dto: CrearArchivoDto = {
        tipoEntidad: req.body.tipoEntidad,
        idEvento: req.body.idEvento ? Number(req.body.idEvento) : undefined,
        idInstitucion: req.body.idInstitucion
          ? Number(req.body.idInstitucion)
          : undefined,
        idLocal: req.body.idLocal ? Number(req.body.idLocal) : undefined,
        idSalon: req.body.idSalon ? Number(req.body.idSalon) : undefined,

        idSubsalon: req.body.idSubsalon
          ? Number(req.body.idSubsalon)
          : undefined,

        idConfiguracion: req.body.idConfiguracion
          ? Number(req.body.idConfiguracion)
          : undefined,
        tipoArchivo: req.body.tipoArchivo,
        idExpositor: req.body.idExpositor
          ? Number(req.body.idExpositor)
          : undefined,
      };

      const archivo = await this.archivosService.guardarArchivo(dto, req.file);

      return res.status(201).json({
        mensaje: "Archivo registrado correctamente.",
        data: archivo,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(400).json({
        mensaje: error.message,
      });
    }
  };

  obtenerArchivo = async (req: Request, res: Response) => {
    try {
      const idArchivo = Number(req.params.idArchivo);

      if (isNaN(idArchivo)) {
        return res.status(400).json({
          mensaje: "El idArchivo es inválido.",
        });
      }

      const archivo = await this.archivosService.obtenerArchivo(idArchivo);

      return res.status(200).json(archivo);
    } catch (error: any) {
      console.error(error);

      return res.status(404).json({
        mensaje: error.message,
      });
    }
  };

  obtenerActivo = async (req: Request, res: Response) => {
    try {
      const { tipoEntidad, id, tipoArchivo } = req.query;

      if (!tipoEntidad || !id || !tipoArchivo) {
        return res.status(400).json({
          mensaje: "Faltan parámetros: tipoEntidad, id y tipoArchivo.",
        });
      }

      const archivo = await this.archivosService.obtenerActivo({
        tipoEntidad: tipoEntidad as any,
        id: Number(id),
        tipoArchivo: tipoArchivo as string,
      });

      if (!archivo) {
        return res.status(404).json({
          mensaje: "Archivo no encontrado.",
        });
      }

      if (!fs.existsSync(archivo.urlArchivo)) {
        return res.status(404).json({
          mensaje: "El archivo físico no existe.",
        });
      }

      return res.sendFile(archivo.urlArchivo);
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        mensaje: error.message,
      });
    }
  };
}
