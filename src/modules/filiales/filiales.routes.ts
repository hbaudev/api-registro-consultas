import { Router } from "express";
import { requireAuthentication, requireRoles } from "../../middleware/require-auth.ts";
import {
  anularFilialController,
  crearFilialController,
  editarFilialController,
  listarFilialesController,
  obtenerFilialController,
} from "./filiales.controller.ts";

export const filialesRoutes = Router();

filialesRoutes.use(requireAuthentication);
filialesRoutes.get("/", listarFilialesController);
filialesRoutes.get("/:id", obtenerFilialController);
filialesRoutes.post("/", requireRoles("Administrador"), crearFilialController);
filialesRoutes.put("/:id", requireRoles("Administrador"), editarFilialController);
filialesRoutes.delete("/:id", requireRoles("Administrador"), anularFilialController);
