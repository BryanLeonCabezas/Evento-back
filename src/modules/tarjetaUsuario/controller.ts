import { Request, Response } from "express";
import { TarjetaUsuarioService } from "./service.js";

export class TarjetaUsuarioController {

    constructor(private tarjetaUsuarioService: TarjetaUsuarioService) {}

    obtenerTarjetaXId = async (req: Request, res: Response) => {
      const idTarjeta = Number(req.params.idTarjeta);
      const tarjeta = await this.tarjetaUsuarioService.obtenerTarjetaXId(idTarjeta);
      res.status(200).json(tarjeta);
    }

    obtenerTarjetaXIdUsuario = async (req: Request, res: Response) => {
      const idUsuario = Number(req.params.idUsuario);
      const tarjeta = await this.tarjetaUsuarioService.obtenerTarjetaXIdUsuario(idUsuario);
      res.status(200).json(tarjeta);
    }

    guardarTarjetaPaymentez = async (req: Request, res: Response) => {
      const idCliente = req.params.idCliente;
      const paymentezResponse = req.body;
      const tarjeta = await this.tarjetaUsuarioService.guardarTarjetaPaymentez(idCliente, paymentezResponse);
      res.status(200).json(tarjeta);
    }

    eliminarTarjeta = async (req: Request, res: Response) => {
      const idTarjeta = Number(req.params.idTarjeta);
      const tarjeta = await this.tarjetaUsuarioService.eliminarTarjeta(idTarjeta);
      res.status(200).json(tarjeta);
    }
}