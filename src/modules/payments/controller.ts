import { Request, Response } from "express";
import { PaymentsService } from "./service.js";
import { PaymentezProvider } from "./providers/paymentez.js";
import { env } from "../../config/env.js";

const service = new PaymentsService(new PaymentezProvider(
  {
    appCode: process.env.PAYMENTEZ_APP_CODE!,
    appKey: process.env.PAYMENTEZ_APP_KEY!,
  }
));
export const listarTarjetas = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const cards = await service.listarTarjetas(userId);
    res.json(cards);
  } catch (error) {
    console.error("Error al listar tarjetas:", error);
    res.status(500).json({ error: "Error al listar tarjetas" });
  }
};

export const eliminarTarjeta = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    const data = await service.eliminarTarjeta(userId, token);
    res.json(data);
  } catch (error: any) {
    res.status(500).json(error.response?.data || error.message);
  }
};

export const debitar = async (req: Request, res: Response) => {
  try {
    const data = await service.debitar(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json(error.response?.data || error.message);
  }
};
