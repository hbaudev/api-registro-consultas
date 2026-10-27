import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import { listarEspecialidadesController } from "./especialidades.controller.ts";

export const especialidadesRoutes = Router();

especialidadesRoutes.use(requireAuthentication);
especialidadesRoutes.get(
    "/",
    requireRoles("Administrador", "Admisionista"),
    listarEspecialidadesController,
);