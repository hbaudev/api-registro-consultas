import type { RequestHandler } from "express";
import { config, type UserRole } from "../config/env.ts";
import { authenticateSession, AuthenticationError } from "../modules/auth/auth.service.ts";

export const requireAuthentication: RequestHandler = async (request, response, next) => {
  const token = request.cookies?.[config.sessionCookie.name];
  if (typeof token !== "string" || token.length > 256) {
    response.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  try {
    request.authUser = await authenticateSession(token);
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.clearCookie(config.sessionCookie.name, {
        httpOnly: true,
        secure: config.sessionCookie.secure,
        sameSite: config.sessionCookie.sameSite,
        path: "/",
      });
      response.status(401).json({ error: "La sesión no es válida o ha expirado." });
      return;
    }
    next(error);
  }
};

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  if (allowedRoles.length === 0) {
    throw new Error("requireRoles necesita uno o más roles.");
  }

  const permittedIds = new Set(allowedRoles.map((role) => String(config.roleIds[role])));
  return (request, response, next) => {
    const roleId = request.authUser?.roleId;
    if (roleId === null || roleId === undefined || !permittedIds.has(String(roleId))) {
      response.status(403).json({ error: "No tienes permisos para realizar esta operación." });
      return;
    }
    next();
  };
}
