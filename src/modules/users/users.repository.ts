import { getPool } from "../../database/pool.ts";
import type { UserWithPassword } from "../auth/auth.types.ts";

interface UserRow {
  userId: UserWithPassword["userId"];
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  active: UserWithPassword["active"];
  roleId: number | string | null;
}

export async function findUserByUsername(username: string): Promise<UserWithPassword | undefined> {
  const pool = await getPool();
  const rows = await pool.query<UserRow>(
    `SELECT TOP (1)
       [UsuarioId] AS [userId],
       [NombreUsuario] AS [username],
       [ContrasenaHash] AS [passwordHash],
       [Nombre] AS [firstName],
       [Apellido] AS [lastName],
       [Activo] AS [active],
       [RolID] AS [roleId]
     FROM [dbo].[Usuarios]
     WHERE [NombreUsuario] = ?`,
    [username],
  );

  const row = rows[0];
  if (!row) return undefined;
  return {
    userId: row.userId,
    username: row.username,
    passwordHash: row.passwordHash,
    firstName: row.firstName,
    lastName: row.lastName,
    active: row.active,
    roleId: row.roleId,
  };
}

export async function updateLastAccess(userId: UserWithPassword["userId"]): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "UPDATE [dbo].[Usuarios] SET [UltimoAcceso] = SYSUTCDATETIME() WHERE [UsuarioId] = ?",
    [userId],
  );
}
