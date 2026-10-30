import type { RequestHandler } from "express";
import { validarPerCapita, obtenerTiposAfiliado, registrarConsulta } from "./registro.service.ts";
import { parseNumeroInss, parseCrearConsultaInput } from "./registro.validation.ts";
import { RegistroRequestError } from "./registro.errors.ts";

export const validarPerCapitaController: RequestHandler = async (request, response, next) => {
  const numeroInss = parseNumeroInss(request.params.inss);
  if (numeroInss === undefined) {
    response.status(400).json({ error: "El numero INSS no es valido." });
    return;
  }

  try {
    const afiliado = await validarPerCapita(numeroInss);
    if (!afiliado) {
      response.status(404).json({ error: "No se encontro un afiliado con ese numero INSS." });
      return;
    }

    response.status(200).json({ message: "Afiliado encontrado", afiliado });
  } catch (error) {
    next(error);
  }
};

export const obtenerTipoAfiliadoController: RequestHandler = async (_request, response, next) => {
  try {
    const tiposAfiliados = await obtenerTiposAfiliado();
    response.status(200).json({ tiposAfiliados });
  } catch (error) {
    next(error);
  }
};

export const crearConsultaController: RequestHandler = async (request, response, next) => {
  const input = parseCrearConsultaInput(request.body);
  if (!input) {
    response.status(400).json({
      error: "Datos inválidos. Verifica el código de programación y el número INSS del paciente.",
    });
    return;
  }

  const username = request.authUser?.username;
  if (!username) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    const result = await registrarConsulta(input, username);
    response.status(201).json(result);
  } catch (error) {
    if (error instanceof RegistroRequestError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
};
