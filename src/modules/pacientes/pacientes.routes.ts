import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import {
  listarPacientesController,
  obtenerExpedientePorInssController,
  obtenerPacienteCompletoPorInssController,
} from "./pacientes.controller.ts";

export const pacientesRoutes = Router();

pacientesRoutes.use(requireAuthentication);
pacientesRoutes.get(
  "/",
  requireRoles("Administrador", "Admisionista"),
  listarPacientesController,
);
pacientesRoutes.get(
  "/expediente/:inss",
  requireRoles("Administrador", "Admisionista"),
  obtenerExpedientePorInssController,
);
pacientesRoutes.get(
  "/obtener-paciente-completo/:inss",
  requireRoles("Administrador", "Admisionista"),
  obtenerPacienteCompletoPorInssController,
);