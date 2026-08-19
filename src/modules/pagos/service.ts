// src/modules/pagos/service.ts

import { EntityManager } from "typeorm";
import { Pagos } from "./entity.js";
import { EventosUsuarios } from "../eventoUsuario/entity.js";
import { PagoNormalizado } from "./dto/pago-normalizado.dto.js";
import { pagoRepository } from "./repository.js";
import { PagoDetalleResponseDto } from "./dto/pagoDetalle.dto.js";
import { generarDevReference } from "../../common/utils/dev_reference.utils.js";

interface RegistrarPagoDto {
  normalizado: PagoNormalizado;
  idEvento: number;
  idCliente: string;
  eventoUsuario?: EventosUsuarios | null;
  devReference?: string; //
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

    pago.referencia =
      dto.devReference ??
      n.devReference ??
      generarDevReference(idEvento, idCliente);

    pago.eventoUsuario = eventoUsuario ?? null;
    pago.idEvento = idEvento;
    pago.idCliente = idCliente;
    pago.tipoPago = n.tipo;
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
    pago.idCupon = n.idCupon ?? undefined;                    
    pago.descuentoAplicado = n.descuentoAplicado ?? 0;   
    return pago;
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
      transaccionId: pago.transaccionId ?? null,
      pasarela: pago.pasarela ?? null,
      estado: pago.estado ?? null,
      tipoPago: pago.tipoPago,
      monto: pago.monto ?? 0,
      moneda: pago.moneda ?? "",
      esGratis: pago.esGratis === "S",
      marcaTarjeta: pago.marcaTarjeta ?? null,
      ultimos4: pago.ultimos4 ?? null,
      fechaPago: pago.fechaPago ?? null,
      fechaRegistro: pago.fechaRegistro! ?? null,
    };
  }

  async obtenerPagoXReferencia(referencia: string): Promise<Pagos | null> {
    return await pagoRepository.findOne({ where: { referencia } });
  }

  async actualizarPago(
    manager: EntityManager,
    pago: Pagos,
    normalizado: PagoNormalizado,
    eventoUsuario: EventosUsuarios,
  ) {
    const esExitoso =
      normalizado.estado === "APPROVED" || normalizado.tipo === "GRATUITO";

    pago.transaccionId = normalizado.transaccionId;
    pago.estado = normalizado.estado;
    pago.detalleEstado = normalizado.detalleEstado;
    pago.metodoPago = normalizado.metodoPago;
    pago.marcaTarjeta = normalizado.marcaTarjeta;
    pago.ultimos4 = normalizado.ultimos4;
    pago.tipoPago = normalizado.tipo;
    pago.eventoUsuario = eventoUsuario;

    pago.fechaPago = esExitoso ? new Date() : null;
    pago.origenPago = normalizado.origen;
    pago.responseJson = normalizado.responseJson
      ? JSON.stringify(normalizado.responseJson)
      : null;

    return await manager.save(pago);
  }
}
