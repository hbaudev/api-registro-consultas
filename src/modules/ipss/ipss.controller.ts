import type { RequestHandler } from "express";
import { validarPerCapita, obtenerTiposAfiliado } from "./ipss.service.ts";
import { parseNumeroInss } from "./ipss.validation.ts";

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

    response.status(200).json({ afiliado });
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
