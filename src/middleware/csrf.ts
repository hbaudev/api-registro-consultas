import type { RequestHandler } from "express";
import { config } from "../config/env.ts";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedOrigins = new Set(config.trustedOrigins);

export const csrfProtection: RequestHandler = (request, response, next) => {
  if (safeMethods.has(request.method)) {
    next();
    return;
  }

  const origin = request.get("origin");
  const hasSessionCookie = typeof request.cookies?.[config.sessionCookie.name] === "string";
  if (!hasSessionCookie) {
    next();
    return;
  }

  if (!origin || !allowedOrigins.has(origin)) {
    response.status(403).json({ error: "Origen no permitido." });
    return;
  }

  next();
};
