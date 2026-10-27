import bcrypt from "bcrypt";
import { emitKeypressEvents } from "node:readline";
import { closePools } from "../database/pool.ts";
import { withTransaction } from "../database/transaction.ts";
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

async function createFirstAdmin(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Ejecuta pnpm run create-admin desde una terminal interactiva.");
  }
  const username = await ask("Nombre de usuario (máximo 50 caracteres): ");
  if (!username || username.length > 50) throw new Error("El usuario debe tener entre 1 y 50 caracteres.");
  const firstName = await ask("Nombre: ");
  if (!firstName || firstName.length > 50) throw new Error("El nombre debe tener entre 1 y 50 caracteres.");
  const lastName = await ask("Apellido (opcional): ");
  if (lastName.length > 50) throw new Error("El apellido no puede superar 50 caracteres.");

  const password = await askSecret("Contraseña (mínimo 12 caracteres, entrada oculta): ");
  const confirmation = await askSecret("Confirma la contraseña: ");
  if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("La contraseña debe tener al menos 12 caracteres y no superar 72 bytes UTF-8.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const storedPasswordHash = await withTransaction(async (connection) => {
    const countRows = await connection.query<{ existingUsers: number | string }>(
      "SELECT COUNT_BIG(*) AS [existingUsers] FROM [dbo].[Usuarios] WITH (TABLOCKX, HOLDLOCK)",
    );
    if (Number(countRows[0]?.existingUsers ?? 0) > 0) {
      throw new Error("Ya existe al menos un usuario; no se creó el administrador inicial.");
    }

    const roles = await connection.query<{ roleId: number | string }>(
      "SELECT TOP (1) [RolID] AS [roleId] FROM [dbo].[Roles] WHERE [RolID] = ?",
      [config.roleIds.Administrador],
    );
    if (!roles[0]) throw new Error("No existe el rol de administrador configurado en dbo.Roles.");

    const inserted = await connection.query<{ passwordHash: string }>(
      `INSERT INTO [dbo].[Usuarios]
         ([NombreUsuario], [ContrasenaHash], [Nombre], [Apellido], [Activo], [RolID])
       OUTPUT inserted.[ContrasenaHash] AS [passwordHash]
       VALUES (?, ?, ?, NULLIF(CAST(? AS NVARCHAR(50)), N''), 1, ?)`,
      [username, passwordHash, firstName, lastName, config.roleIds.Administrador],
    );
    return inserted[0]?.passwordHash;
  });

  if (!storedPasswordHash || !(await bcrypt.compare(password, storedPasswordHash))) {
    throw new Error("La contraseña no se almacenó correctamente como bcrypt.");
  }
  console.log(`Administrador inicial creado para el usuario "${username}".`);
}

function errorDetails(error: unknown): string {
  if (!(error instanceof Error)) return "Error desconocido.";
  const diagnostics = "odbcErrors" in error && Array.isArray(error.odbcErrors)
    ? error.odbcErrors.map((diagnostic: { code?: number; state?: string; message?: string }) => {
      const code = diagnostic.code === undefined ? "" : ` (${diagnostic.code})`;
      const state = diagnostic.state ? ` SQLSTATE ${diagnostic.state}` : "";
      return `${diagnostic.message ?? "Error ODBC"}${code}${state}`;
    }).join("; ")
    : "";
  return diagnostics ? `${error.message}: ${diagnostics}` : error.message;
}

try {
  await createFirstAdmin();
} catch (error) {
  console.error(`No se pudo crear el administrador inicial: ${errorDetails(error)}`);
  process.exitCode = 1;
} finally {
  try { await closePools(); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido.";
    console.error(`No se pudieron cerrar los pools de base de datos: ${message}`);
    process.exitCode = 1;
  }
}
