import type { RequestHandler } from "express";
import { listarMedicos } from "./medicos.service.ts";
import { parseListarMedicosQuery } from "./medicos.validation.ts";

export const listarMedicosController: RequestHandler = async (request, response, next) => {
    const query = parseListarMedicosQuery(request.query);
    if (!query) {
        response.status(400).json({
            error: "Los filtros deben ser validos; tamanioPagina debe estar entre 1 y 100.",
        });
        return;
    }

    try {
        response.status(200).json(await listarMedicos(query));
    } catch (error) {
        if (error instanceof Error) {
            response.status(404).json({ error: error.message });
        } else {
            next(error);
        }
    }
};