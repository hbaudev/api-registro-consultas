import { RequestHandler } from "express";
import { listarEspecialidades } from "./especialidades.service.ts";
import { parseListarEspecialidadesQuery } from "./especialidades.validation.ts";

export const listarEspecialidadesController: RequestHandler = async (request, response, next) => {
    const query = parseListarEspecialidadesQuery(request.query);
    if (!query) {
        response.status(400).json({
            error: "Los filtros deben ser validos; el tamaño de página debe estar entre 1 y 100.",
        });
        return;
    }

    try {
        response.status(200).json(await listarEspecialidades(query));
    } catch (error) {
        next(error);
    }
}