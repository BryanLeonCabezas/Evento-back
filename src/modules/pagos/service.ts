// src/modules/pagos/service.ts

import { EntityManager } from "typeorm";
import { Pagos } from "./entity.js";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { PagoNormalizado } from "./dto/pago-normalizado.dto.js";
import { pagoRepository } from "./repository.js";
import { PagoDetalleResponseDto } from "./dto/pagoDetalle.dto.js";

interface RegistrarPagoDto {
  normalizado: PagoNormalizado;
  idEvento: number;
  idCliente: string;
  eventoUsuario?: EventosUsuarios | null;
}

export class PagosService {
  // ── Dentro de la transacción (pago exitoso o gratuito) ────────────────
  async registrarEnTransaccion(
    manager: EntityManager,
    dto: RegistrarPagoDto,
  ): Promise<Pagos> {
    const pago = this.construirEntidad(dto);
    return await manager.save(pago);
  }

  // ── Fuera de la transacción (fallo o reembolso — no debe revertirse) ──
  async registrarFueraTransaccion(dto: RegistrarPagoDto): Promise<void> {
    try {
      const pago = this.construirEntidad(dto);
      await pagoRepository.save(pago);
    } catch (err) {
      // Solo loguear, nunca lanzar — no queremos pisar el error original
      console.error("ERROR al guardar pago fallido/reembolso en PAGOS:", err);
    }
  }

  private construirEntidad(dto: RegistrarPagoDto): Pagos {
    const { normalizado: n, idEvento, idCliente, eventoUsuario } = dto;

    const pago = new Pagos();
    pago.eventoUsuario = eventoUsuario ?? null;
    pago.idEvento = idEvento;
    pago.idCliente = idCliente;
    pago.tipoPago = n.tipo;
    pago.referencia = this.generarReferencia();
    pago.pasarela = n.pasarela;
    pago.transaccionId = n.transaccionId;
    pago.monto = n.monto;
    pago.moneda = n.moneda;
    pago.estado = n.estado;
    pago.detalleEstado = n.detalleEstado;
    pago.metodoPago = n.metodoPago;
    pago.marcaTarjeta = n.marcaTarjeta;
    pago.ultimos4 = n.ultimos4;
    pago.esGratis = n.tipo === "GRATUITO" ? "S" : "N";
    pago.fechaPago = ["APROBADO", "GRATUITO"].includes(n.estado)
      ? new Date()
      : null;
    pago.responseJson = n.responseJson ? JSON.stringify(n.responseJson) : null;

    return pago;
  }

  private generarReferencia(): string {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `PAY-${Date.now()}-${random}`;
  }

  async obtenerDetallesPago(idEvento: number, idCliente: string) {
    const pago = await pagoRepository
      .createQueryBuilder("p")
      .innerJoin("p.eventoUsuario", "eu")
      .where("eu.idEvento = :idEvento", { idEvento })
      .andWhere("eu.idCliente = :idCliente", { idCliente })
      .orderBy("p.fechaRegistro", "DESC")
      .getOne();

    if (!pago) return null;
    return this.mapToDetalleDto(pago);
  }

  private mapToDetalleDto(pago: Pagos): PagoDetalleResponseDto {
    return {
      idPago: pago.idPago,
      transaccionId: pago.transaccionId,
      pasarela: pago.pasarela,
      estado: pago.estado,
      tipoPago: pago.tipoPago,
      monto: pago.monto,
      moneda: pago.moneda,
      esGratis: pago.esGratis === "S",
      marcaTarjeta: pago.marcaTarjeta,
      ultimos4: pago.ultimos4,
      fechaPago: pago.fechaPago,
      fechaRegistro: pago.fechaRegistro,
    };
  }
}
