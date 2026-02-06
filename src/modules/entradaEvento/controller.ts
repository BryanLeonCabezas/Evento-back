import { Request, Response } from "express";
import { EntradaEventoService } from "./service.js";

export class EntradaEventoController {
  constructor(private entradaEventoService: EntradaEventoService) {}

  getEntradaPorEventoYCliente = async (req: Request, res: Response) => {
    const idEvento = Number(req.params.idEvento);
    const idCliente = req.params.idCliente;

    const entrada =
      await this.entradaEventoService.obtenerEntradaPorEventoYCliente(
        idEvento,
        idCliente,
      );

    if (!entrada) {
      return res.status(404).json({ message: "Entrada no encontrada" });
    }

    res.status(200).json(entrada);
  };

  registrarEntradaCompra = async (req: Request, res: Response) => {
    const { idEvento, idCliente } = req.body;

    const entrada = await this.entradaEventoService.registrarEntradaCompra(
      idEvento,
      idCliente,
    );

    res.status(201).json(entrada);
  };

  cancelarEntrada = async (req: Request, res: Response) => {
    const idEntrada = Number(req.params.idEntrada);

    await this.entradaEventoService.cancelarEntrada(idEntrada);

    res.status(204).send();
  };

  validarEntrada = async (req: Request, res: Response) => {
    const { qrToken, qrHash } = req.body;
    const entrada = await this.entradaEventoService.validarEntradaQR(qrToken, qrHash);

    res.status(200).json(entrada);
  };
}
