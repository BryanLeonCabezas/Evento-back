import { createHash, randomUUID } from "crypto";
import { AppError } from "../../common/utils/App.error.js";
import { entradaEventoRepository } from "./repository.js";
import { en, th } from "zod/locales";
import e from "express";
import { generateQrHash } from "../../common/utils/crypto.util.js";
import { EntradasEvento } from "./entity.js";

export class EntradaEventoService {
  private entradaEventoRepository = entradaEventoRepository;

  async registrarEntradaCompra(idEvento: number, idCliente: string) {
    if (!idEvento || !idCliente) {
      throw new AppError("idEvento and idCliente son requeridos", 400);
    }

    const existeEntrada = await this.entradaEventoRepository.findOne({
      where: {
        evento: { idEvento },
        usuario: { idCliente },
      },
    });

    if (existeEntrada) {
      throw new AppError(
        "El usuario ya tiene una entrada para este evento",
        400,
      );
    }

    const qrToken = randomUUID();

    const qrHash = generateQrHash(qrToken);

    const entrada = this.entradaEventoRepository.create({
      evento: { idEvento } as any,
      usuario: { idCliente } as any,
      qrToken,
      qrHash,
      estado: "ACTIVO",
      intentosValidacion: 0,
    });

    await this.entradaEventoRepository.save(entrada);

    return {
      idEntrada: entrada.idEntrada,
      qrToken,
      estado: entrada.estado,
    };
  }

  async obtenerEntradaPorEventoYCliente(idEvento: number, idCliente: string) {
    return await this.entradaEventoRepository.findOne({
      where: {
        evento: { idEvento },
        usuario: { idCliente },
      },
    });
  }

  async validarEntradaQR(qrToken: string, qrHash: string) {
    const queryRunner =
      this.entradaEventoRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashCalculado = generateQrHash(qrToken);
      if (hashCalculado !== qrHash) {
        throw new AppError("QR inválido", 400);
      }

      const result = await queryRunner.manager
        .createQueryBuilder()
        .update("ENTRADAS_EVENTO")
        .set({
          estado: "USADO",
          fechaUso: () => "CURRENT_TIMESTAMP",
          intentosValidacion: () => "INTENTOS_VALIDACION + 1",
        })
        .where("QR_TOKEN = :qrToken", { qrToken })
        .andWhere("ESTADO = 'ACTIVO'")
        .execute();

      if (result.affected === 0) {
        throw new AppError("QR inválido o ya utilizado", 400);
      }

      const entrada = await queryRunner.manager.findOne(EntradasEvento, {
        where: { qrToken },
        relations: ["usuario", "evento"],
      });

      await queryRunner.commitTransaction();

      return {
        acceso: true,
        evento: entrada?.evento.idEvento,
        cliente: entrada?.usuario.idCliente,
        fechaUso: entrada?.fechaUso,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

async cancelarEntrada(idEntrada: number) {
  if (!idEntrada) {
    throw new AppError("idEntrada es requerido", 400);
  }

  const result = await this.entradaEventoRepository
    .createQueryBuilder()
    .update()
    .set({
      estado: "CANCELADO",
    })
    .where("idEntrada = :idEntrada", { idEntrada })
    .andWhere("estado = 'ACTIVO'")
    .execute();

  if (result.affected === 0) {
    throw new AppError(
      "No se puede cancelar la entrada (ya usada o inexistente)",
      400,
    );
  }

  return {
    cancelado: true,
    idEntrada,
  };
}

}
