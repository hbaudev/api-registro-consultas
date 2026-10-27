import type { RequestHandler } from "express";
import { listarConsultorios } from "./consultorios.service.ts";
import { parseListarConsultoriosQuery } from "./consultorios.validation.ts";

export const listarConsultoriosController: RequestHandler = async (request, response, next) => {
    const query = parseListarConsultoriosQuery(request.query);
    if (!query) {
        response.status(400).json({
            error: "Los filtros deben ser validos; tamanioPagina debe estar entre 1 y 100.",
        });
        return;
    }

    try {
        response.status(200).json(await listarConsultorios(query));
    } catch (error) {
        if (error instanceof Error) {
            response.status(404).json({ error: error.message });
        } else {
            next(error);
        }
    }
};