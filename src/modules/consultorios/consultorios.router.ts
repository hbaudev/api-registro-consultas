import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import { listarConsultoriosController } from "./consultorios.controller.ts";

export const consultoriosRoutes = Router();

consultoriosRoutes.use(requireAuthentication);
consultoriosRoutes.get(
    "/",
    requireRoles("Administrador", "Admisionista"),
    listarConsultoriosController,
);