import { Request, Response } from "express";
import { TarjetaUsuarioService } from "./service.js";

export class TarjetaUsuarioController {
  constructor(private tarjetaUsuarioService: TarjetaUsuarioService) {}

  obtenerTarjetaXId = async (req: Request, res: Response) => {
    const idTarjeta = Number(req.params.idTarjeta);
    const tarjeta =
      await this.tarjetaUsuarioService.obtenerTarjetaPorId(idTarjeta);
    res.status(200).json(tarjeta);
  };

  obtenerTarjetaXIdUsuario = async (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario;
    const tarjeta = await this.tarjetaUsuarioService.obtenerTarjetaPorIdUsuario(
      String(idUsuario),
    );
    res.status(200).json(tarjeta);
  };

  guardarTarjetaPaymentez = async (req: Request, res: Response) => {
    const idCliente = req.params.idCliente;
    const paymentezResponse = req.body.paymentezResponse;
    const tarjetaReq = req.body.tarjetaReq;
    const tarjeta = await this.tarjetaUsuarioService.guardarTarjetaPaymentez(
      idCliente,
      tarjetaReq,
      paymentezResponse,
    );
    res.status(200).json(tarjeta);
  };

  eliminarTarjeta = async (req: Request, res: Response) => {
    const idTarjeta = Number(req.params.idTarjeta);
    const tarjeta = await this.tarjetaUsuarioService.eliminarTarjeta(idTarjeta);
    res.status(200).json(tarjeta);
  };

  establecerPredeterminada = async (req: Request, res: Response) => {
    const { idTarjeta } = req.body;
    const idUsuario = req.params.idCliente;

    const tarjeta =
      await this.tarjetaUsuarioService.establecerPredeterminada(
        idUsuario,
        idTarjeta,
      );

    res.status(200).json(tarjeta);
  };
}
