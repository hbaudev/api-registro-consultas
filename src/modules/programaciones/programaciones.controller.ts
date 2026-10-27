import type { RequestHandler } from "express";
import {
  cancelarProgramacion,
  listarProgramaciones,
  registrarProgramacion,
} from "./programaciones.service.ts";
import {
  parseAnularProgramacionInput,
  parseCrearProgramacionInput,
  parseListarProgramacionesQuery,
} from "./programaciones.validation.ts";
import { ProgramacionRequestError } from "./programaciones.errors.ts";

export const listarProgramacionesController: RequestHandler = async (request, response, next) => {
  const query = parseListarProgramacionesQuery(request.query);
  if (!query) {
    response.status(400).json({ error: "Los filtros de programación no son válidos." });
    return;
  }

  try {
    response.status(200).json(await listarProgramaciones(query));
  } catch (error) {
    next(error);
  }
};

export const crearProgramacionController: RequestHandler = async (request, response, next) => {
  const input = parseCrearProgramacionInput(request.body);
  if (!input) {
    response.status(400).json({
      error: "Datos inválidos. Verifica la fecha, jornada AM/PM, límite de 1 a 60, código MINSA y número de consultorio.",
    });
    return;
  }
  const username = request.authUser?.username;
  if (!username) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    const programacion = await registrarProgramacion(input, username);
    response.status(201).json({ ...programacion, mensaje: "Programación creada." });
  } catch (error) {
    if (error instanceof ProgramacionRequestError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const anularProgramacionController: RequestHandler = async (request, response, next) => {
  const input = parseAnularProgramacionInput(request.params.codigoProgramacion, request.body);
  if (!input) {
    response.status(400).json({
      error: "El código de programación o el motivo de anulación no es válido.",
    });
    return;
  }
  const username = request.authUser?.username;
  if (!username) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    await cancelarProgramacion(input, username);
    response.status(204).end();
  } catch (error) {
    if (error instanceof ProgramacionRequestError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
};
