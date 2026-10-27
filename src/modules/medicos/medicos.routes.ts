import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import {
    listarMedicosController,
} from "./medicos.controller.ts";

export const medicosRoutes = Router();

medicosRoutes.use(requireAuthentication);
medicosRoutes.get(
    "/",
    requireRoles("Administrador", "Admisionista"),
    listarMedicosController,
);
