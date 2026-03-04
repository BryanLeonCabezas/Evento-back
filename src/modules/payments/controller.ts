import { Request, Response } from "express";
import { PaymentsService } from "./service.js";

const service = new PaymentsService("paymentez");

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
