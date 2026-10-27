import { resolveRole } from "../../config/env.ts";
import { getPool } from "../../database/pool.ts";
import { withTransaction } from "../../database/transaction.ts";
import type { AuthenticatedUser, UserId } from "./auth.types.ts";

interface SessionUserRow {
  userId: UserId;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number | string | null;
}

interface CurrentSessionRow extends SessionUserRow {
  refreshTokenId: string;
}

function toAuthenticatedUser(row: SessionUserRow): AuthenticatedUser {
  return {
    userId: row.userId,
    username: row.username,
    firstName: row.firstName,
    lastName: row.lastName,
    roleId: row.roleId,
    role: resolveRole(row.roleId),
  };
}

export async function createSession(
  userId: UserId,
  tokenHash: string,
  //expiresInHours: number,
  expiresInMinutes: number,
  ipAddress: string,
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `INSERT INTO [dbo].[RefreshTokens]
       ([UsuarioId], [Token], [ExpiresAt], [CreatedAt], [CreatedByIp], [Revoked])
     VALUES (?, ?, DATEADD(MINUTE, ?, SYSUTCDATETIME()), SYSUTCDATETIME(), ?, 0)`,
    //[userId, tokenHash, expiresInHours, ipAddress],
    [userId, tokenHash, expiresInMinutes, ipAddress],
  );
}

export async function findSessionUser(tokenHash: string): Promise<AuthenticatedUser | undefined> {
  const pool = await getPool();
  const rows = await pool.query<SessionUserRow>(
    `SELECT TOP (1)
       u.[UsuarioId] AS [userId],
       u.[NombreUsuario] AS [username],
       u.[Nombre] AS [firstName],
       u.[Apellido] AS [lastName],
       u.[RolID] AS [roleId]
     FROM [dbo].[RefreshTokens] AS rt
     INNER JOIN [dbo].[Usuarios] AS u ON u.[UsuarioId] = rt.[UsuarioId]
     WHERE rt.[Token] = ?
       AND rt.[Revoked] = 0
       AND rt.[ExpiresAt] > SYSUTCDATETIME()
       AND u.[Activo] = 1`,
    [tokenHash],
  );
  return rows[0] ? toAuthenticatedUser(rows[0]) : undefined;
}

export async function rotateSession(
  tokenHash: string,
  replacementTokenHash: string,
  expiresInMinutes: number,
  //expiresInHours: number,
  ipAddress: string,
): Promise<AuthenticatedUser | undefined> {
  return withTransaction(async (connection) => {
    const rows = await connection.query<CurrentSessionRow>(
      `SELECT TOP (1)
         rt.[RefreshTokenId] AS [refreshTokenId],
         u.[UsuarioId] AS [userId],
         u.[NombreUsuario] AS [username],
         u.[Nombre] AS [firstName],
         u.[Apellido] AS [lastName],
         u.[RolID] AS [roleId]
       FROM [dbo].[RefreshTokens] AS rt WITH (UPDLOCK, HOLDLOCK)
       INNER JOIN [dbo].[Usuarios] AS u ON u.[UsuarioId] = rt.[UsuarioId]
       WHERE rt.[Token] = ?
         AND rt.[Revoked] = 0
         AND rt.[ExpiresAt] > SYSUTCDATETIME()
         AND u.[Activo] = 1`,
      [tokenHash],
    );
    const current = rows[0];
    if (!current) return undefined;

    const inserted = await connection.query<{ refreshTokenId: string }>(
      `INSERT INTO [dbo].[RefreshTokens]
         ([UsuarioId], [Token], [ExpiresAt], [CreatedAt], [CreatedByIp], [Revoked])
       OUTPUT inserted.[RefreshTokenId] AS [refreshTokenId]
       VALUES (?, ?, DATEADD(MINUTE, ?, SYSUTCDATETIME()), SYSUTCDATETIME(), ?, 0)`,
      //[current.userId, replacementTokenHash, expiresInHours, ipAddress],
      [current.userId, replacementTokenHash, expiresInMinutes, ipAddress],
    );
    const replacementId = inserted[0]?.refreshTokenId;
    if (!replacementId) throw new Error("No se pudo crear el identificador de la nueva sesión.");

    const revoked = await connection.query<{ refreshTokenId: string }>(
      `UPDATE [dbo].[RefreshTokens]
       SET [Revoked] = 1,
           [RevokedAt] = SYSUTCDATETIME(),
           [ReplacedByToken] = ?
       OUTPUT inserted.[RefreshTokenId] AS [refreshTokenId]
       WHERE [RefreshTokenId] = ? AND [Revoked] = 0`,
      [replacementId, current.refreshTokenId],
    );
    if (revoked.length !== 1) {
      throw new Error("La sesión anterior no se pudo revocar durante la renovación.");
    }

    return toAuthenticatedUser(current);
  });
}

export async function revokeSession(tokenHash: string): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE [dbo].[RefreshTokens]
     SET [Revoked] = 1, [RevokedAt] = SYSUTCDATETIME()
     WHERE [Token] = ? AND [Revoked] = 0`,
    [tokenHash],
  );
}
