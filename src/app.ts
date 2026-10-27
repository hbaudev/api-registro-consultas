import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/env.ts";
import { openApiDocument } from "./config/openapi.ts";
import { csrfProtection } from "./middleware/csrf.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import { filialesRoutes } from "./modules/filiales/filiales.routes.ts";
import { ipssRoutes } from "./modules/ipss/ipss.routes.ts";
import { pacientesRoutes } from "./modules/pacientes/pacientes.routes.ts";
import { especialidadesRoutes } from "./modules/especialidades/especialidades.router.ts";
import { medicosRoutes } from "./modules/medicos/medicos.routes.ts";
import { consultoriosRoutes } from "./modules/consultorios/consultorios.router.ts";
import { programacionesRoutes } from "./modules/programaciones/programaciones.routes.ts";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(config.trustedOrigins);

  // Localmente vale 0; ajusta esta cantidad si la API queda detrás de un proxy.
  app.set("trust proxy", config.trustProxyHops);

  //Deshabilita la cabecera que anuncia que se usa express
  app.disable("x-powered-by")

  //Permite confiar solo en origenes establecidos
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      callback(null, origin !== undefined && allowedOrigins.has(origin));
    },
  }));

  //Limitar el tamaño de los payloads
  app.use(express.json({ limit: "16kb" }));

  //Lee las cookies
  app.use(cookieParser());

  //Muestra la salud del backend 
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  //Configura la documentacion de la API solo en modo desarrollo
  if (config.nodeEnv !== "production") {
    app.get("/api-docs/openapi.json", (_request, response) => {
      response.status(200).json(openApiDocument);
    });
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        customSiteTitle: "Registro de consultas API"
      })
    )
  }

  //Protege la API de ataques CSRF 
  app.use("/api", csrfProtection);

  //Rutas de los modulos
  app.use("/api/auth", authRoutes);
  app.use("/api/filiales", filialesRoutes);
  app.use("/api/ipss", ipssRoutes);
  app.use("/api/pacientes", pacientesRoutes);
  app.use("/api/especialidades", especialidadesRoutes);
  app.use("/api/medicos", medicosRoutes);
  app.use("/api/consultorios", consultoriosRoutes);
  app.use("/api/programaciones", programacionesRoutes);

  //Maneja rutas no encontradas
  app.use((_request, response) => {
    response.status(404).json({ error: "Ruta no encontrada" });
  });

  //Maneja errores
  app.use(errorHandler);

  return app;
}
