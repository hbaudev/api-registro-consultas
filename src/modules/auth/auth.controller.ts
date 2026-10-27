import type { RequestHandler } from "express";
import { config } from "../../config/env.ts";
import { AuthenticationError, login, logout, renewSession } from "./auth.service.ts";
import { parseLoginInput } from "./auth.validation.ts";

export const loginController: RequestHandler = async (request, response, next) => {
  const input = parseLoginInput(request.body);
  if (!input) {
    response.status(400).json({ error: "El usuario o la contraseña no tienen un formato válido." });
    return;
  }

  try {
    const result = await login(input.username, input.password, request.ip || "unknown");
    response.cookie(config.sessionCookie.name, result.token, sessionCookieOptions());
    response.status(200).json({
      user: result.user,
      renewAfterMs: config.sessionRenewAfterMinutes * 60 * 1000,
      //renewAfterMs: config.sessionRenewAfterHours * 60 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log(error)
      response.status(401).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const logoutController: RequestHandler = async (request, response, next) => {
  try {
    const token = request.cookies?.[config.sessionCookie.name];
    await logout(typeof token === "string" ? token : undefined);
    response.clearCookie(config.sessionCookie.name, {
      httpOnly: true,
      secure: config.sessionCookie.secure,
      sameSite: config.sessionCookie.sameSite,
      path: "/",
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const renewSessionController: RequestHandler = async (request, response, next) => {
  const token = request.cookies?.[config.sessionCookie.name];
  if (typeof token !== "string" || token.length > 256) {
    response.status(401).json({ error: "Se requiere una sesión válida para renovarla." });
    return;
  }

  try {
    const result = await renewSession(token, request.ip || "unknown");
    response.cookie(config.sessionCookie.name, result.token, sessionCookieOptions());
    response.status(200).json({
      user: result.user,
      renewAfterMs: config.sessionRenewAfterMinutes * 60 * 1000,
      //renewAfterMs: config.sessionRenewAfterHours * 60 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.clearCookie(config.sessionCookie.name, sessionCookieOptions());
      response.status(401).json({ error: "La sesión no es válida o ha expirado." });
      return;
    }
    next(error);
  }
};

export const currentUserController: RequestHandler = (request, response) => {
  response.status(200).json({
    user: request.authUser,
    renewAfterMs: config.sessionRenewAfterMinutes * 60 * 1000,
    //renewAfterMs: config.sessionRenewAfterHours * 60 * 60 * 1000,
  });
};

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: config.sessionCookie.secure,
    sameSite: config.sessionCookie.sameSite,
    path: "/" as const,
    maxAge: config.sessionTtlMinutes * 60 * 1000,
    //maxAge: config.sessionTtlHours * 60 * 60 * 1000,
  };
}
