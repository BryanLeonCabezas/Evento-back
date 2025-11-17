import { Request, Response } from "express";
import { createEventoUsuario } from "./EventoUsuario.service.js";

export const crearUsuarioHandler = async (req: Request, res: Response) => {
 
    const usuario = await createEventoUsuario(req.body);
    res.status(201).json(usuario);

};
