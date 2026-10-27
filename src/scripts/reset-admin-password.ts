import bcrypt from "bcrypt";
import { emitKeypressEvents } from "node:readline";
import { closePools, getPool } from "../database/pool.ts";
import { config } from "../config/env.ts";

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.once("data", (data) => {
      process.stdout.write("\n");
      resolve(data.toString("utf8").trim());
    });
  });
}

function askSecret(question: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    return Promise.reject(new Error("Este comando requiere una terminal interactiva para ocultar la contraseña."));
  }
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();
  process.stdout.write(question);

  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      input.off("keypress", onKeypress);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
    };
    const onKeypress = (character: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Operación cancelada."));
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        resolve(value);
      } else if (key.name === "backspace") {
        value = value.slice(0, -1);
      } else if (character && !key.ctrl) {
        value += character;
      }
    };
    input.on("keypress", onKeypress);
  });
}

async function resetAdminPassword(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Ejecuta pnpm run reset-admin-password desde una terminal interactiva.");
  }
  const username = await ask("Nombre de usuario del administrador: ");
  if (!username || username.length > 50) throw new Error("El usuario debe tener entre 1 y 50 caracteres.");
  const password = await askSecret("Nueva contraseña (mínimo 12 caracteres, entrada oculta): ");
  const confirmation = await askSecret("Confirma la nueva contraseña: ");
  if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("La contraseña debe tener al menos 12 caracteres y no superar 72 bytes UTF-8.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const pool = await getPool();
  const rows = await pool.query<{ passwordHash: string }>(
    `UPDATE [dbo].[Usuarios]
     SET [ContrasenaHash] = ?
     OUTPUT inserted.[ContrasenaHash] AS [passwordHash]
     WHERE [NombreUsuario] = ? AND [RolID] = ?`,
    [passwordHash, username, config.roleIds.Administrador],
  );
  if (!rows[0]) {
    throw new Error("No se encontró ese usuario con el rol de administrador configurado.");
  }
  if (!(await bcrypt.compare(password, rows[0].passwordHash))) {
    throw new Error("La contraseña no se almacenó correctamente como bcrypt.");
  }
  console.log("La contraseña del administrador se actualizó correctamente.");
}

try {
  await resetAdminPassword();
} catch (error) {
  const message = error instanceof Error ? error.message : "Error desconocido.";
  console.error(`No se pudo restablecer la contraseña: ${message}`);
  process.exitCode = 1;
} finally {
  try { await closePools(); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido.";
    console.error(`No se pudieron cerrar los pools de base de datos: ${message}`);
    process.exitCode = 1;
  }
}
