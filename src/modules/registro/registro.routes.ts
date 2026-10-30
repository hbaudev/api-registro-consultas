import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import {
  crearConsultaController,
  obtenerTipoAfiliadoController,
  validarPerCapitaController,
} from "./registro.controller.ts";

export const registroRoutes = Router();

registroRoutes.use(requireAuthentication);

registroRoutes.post(
  "/",
  requireRoles("Administrador", "Admisionista"),
  crearConsultaController,
);

registroRoutes.get(
  "/tipos-afiliados",
  requireRoles("Administrador", "Admisionista"),
  obtenerTipoAfiliadoController,
);

registroRoutes.get(
  "/:inss",
  requireRoles("Administrador", "Admisionista"),
  validarPerCapitaController,
);
