import { Request, Response } from "express";
import { PagosService } from "./service.js";

export class PagoController {
  constructor(private pagoService: PagosService) {}

  obtenerDetallePago = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idCliente = req.params.idCliente;

    const detallePago = await this.pagoService.obtenerDetallesPago(
      idEvento,
      idCliente,
    );
    if (detallePago) {
      res.status(200).json(detallePago);
    } else {
      res
        .status(404)
        .json({ message: "Pago no encontrado para este evento y cliente." });
    }
  };
}
