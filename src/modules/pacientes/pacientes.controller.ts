import type { RequestHandler } from "express";
import { listarPacientes, obtenerExpedientesPorInss } from "./pacientes.service.ts";
import { parseListarPacientesQuery, parseNumeroInss } from "./pacientes.validation.ts";

export const listarPacientesController: RequestHandler = async (request, response, next) => {
  const query = parseListarPacientesQuery(request.query);
  if (!query) {
    response.status(400).json({
      error: "Los filtros deben ser validos; tamanioPagina debe estar entre 1 y 100.",
    });
    return;
  }

  try {
    response.status(200).json(await listarPacientes(query));
  } catch (error) {
    next(error);
  }
};

export const obtenerExpedientePorInssController: RequestHandler = async (request, response, next) => {
  const numeroInss = parseNumeroInss(request.params.inss);
  if (numeroInss === undefined) {
    response.status(400).json({ error: "El numero INSS no es valido." });
    return;
  }

  try {
    const expedientes = await obtenerExpedientesPorInss(numeroInss);
    if (expedientes.length === 0) {
      response.status(404).json({ error: "No se encontro un expediente para ese numero INSS." });
      return;
    }

    response.status(200).json({ expedientes });
  } catch (error) {
    next(error);
  }
};
