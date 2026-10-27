import type { RequestHandler } from "express";
import {
  actualizarFilial,
  buscarFilial,
  eliminarFilial,
  listarFiliales,
  registrarFilial,
} from "./filiales.service.ts";
import { parseCrearFilialInput, parseEditarFilialInput, parseFilialId } from "./filiales.validation.ts";

export const listarFilialesController: RequestHandler = async (_request, response, next) => {
  try {
    response.status(200).json({ filiales: await listarFiliales() });
  } catch (error) {
    next(error);
  }
};

export const obtenerFilialController: RequestHandler = async (request, response, next) => {
  const filialId = parseFilialId(request.params.id);
  if (filialId === undefined) {
    response.status(400).json({ error: "El ID de filial no es válido." });
    return;
  }

  try {
    const filial = await buscarFilial(filialId);
    if (!filial) {
      response.status(404).json({ error: "La filial no existe o está anulada." });
      return;
    }
    response.status(200).json({ filial });
  } catch (error) {
    next(error);
  }
};

export const crearFilialController: RequestHandler = async (request, response, next) => {
  const input = parseCrearFilialInput(request.body);
  if (!input) {
    response.status(400).json({ error: "Código o nombre de filial inválido." });
    return;
  }
  const usuarioId = request.authUser?.userId;
  if (usuarioId === undefined) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    const filialId = await registrarFilial(input, usuarioId);
    response.status(201).json({ filialId, mensaje: "Filial creada." });
  } catch (error) {
    next(error);
  }
};

export const editarFilialController: RequestHandler = async (request, response, next) => {
  const input = parseEditarFilialInput(request.params, request.body);
  if (!input) {
    response.status(400).json({ error: "ID, código o nombre de filial inválido." });
    return;
  }
  const usuarioId = request.authUser?.userId;
  if (usuarioId === undefined) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    await actualizarFilial(input, usuarioId);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const anularFilialController: RequestHandler = async (request, response, next) => {
  const filialId = parseFilialId(request.params.id);
  if (filialId === undefined) {
    response.status(400).json({ error: "El ID de filial no es válido." });
    return;
  }
  const usuarioId = request.authUser?.userId;
  if (usuarioId === undefined) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    await eliminarFilial(filialId, usuarioId);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};
