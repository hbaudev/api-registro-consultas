import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import {
  anularProgramacionController,
  crearProgramacionController,
  listarProgramacionesController,
} from "./programaciones.controller.ts";

export const programacionesRoutes = Router();

programacionesRoutes.use(requireAuthentication);
programacionesRoutes.get(
  "/",
  requireRoles("Administrador", "Admisionista"),
  listarProgramacionesController,
);
programacionesRoutes.post(
  "/",
  requireRoles("Administrador", "Admisionista"),
  crearProgramacionController,
);
programacionesRoutes.delete(
  "/:codigoProgramacion",
  requireRoles("Administrador", "Admisionista"),
  anularProgramacionController,
);
