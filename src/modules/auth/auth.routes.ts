import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuthentication } from "../../middleware/require-auth.ts";
import {
  currentUserController,
  loginController,
  logoutController,
  renewSessionController,
} from "./auth.controller.ts";

export const authRoutes = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Demasiados intentos. Intenta de nuevo más tarde." },
});

const renewalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de renovación. Intenta más tarde." },
});

authRoutes.post("/login", loginRateLimit, loginController);
authRoutes.post("/logout", logoutController);
authRoutes.post("/refresh", renewalRateLimit, renewSessionController);
authRoutes.get("/me", requireAuthentication, currentUserController);
