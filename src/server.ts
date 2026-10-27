import "dotenv/config";
import { createApp } from "./app.ts";
import { closePools } from "./database/pool.ts";

//Configura la aplicacion
const app = createApp();

//Establece el puerto
const port = Number(process.env.PORT ?? 3000);

//Valida el puerto
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un número entre 1 y 65535.");
}

//Inicia el servidor
const server = app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

//Cierra el servidor
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      try {
        await closePools();
      } finally {
        process.exit(0);
      }
    });
  });
}
