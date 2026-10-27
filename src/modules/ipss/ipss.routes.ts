import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import { obtenerTipoAfiliadoController, validarPerCapitaController } from "./ipss.controller.ts";

export const ipssRoutes = Router();

ipssRoutes.use(requireAuthentication);
ipssRoutes.get(
  "/tipos-afiliados",
  requireRoles("Administrador", "Admisionista"),
  obtenerTipoAfiliadoController,
);
ipssRoutes.get(
  "/:inss",
  requireRoles("Administrador", "Admisionista"),
  validarPerCapitaController,
);
