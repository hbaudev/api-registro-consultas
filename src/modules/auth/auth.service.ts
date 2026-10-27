import bcrypt from "bcrypt";
import { config, resolveRole } from "../../config/env.ts";
import { createSession, findSessionUser, revokeSession, rotateSession } from "./auth.repository.ts";
import type { AuthenticatedUser } from "./auth.types.ts";
import { findUserByUsername, updateLastAccess } from "../users/users.repository.ts";
import { createSessionToken, hashSessionToken } from "../../utils/tokens.ts";

const dummyPasswordHash = bcrypt.hash("not-a-real-user-password", 12);

export async function login(
  username: string,
  password: string,
  ipAddress: string,
): Promise<{ user: AuthenticatedUser; token: string }> {
  const user = await findUserByUsername(username);
  const hash = user?.passwordHash ?? await dummyPasswordHash;
  const passwordMatches = await bcrypt.compare(password, hash);

  if (!user || !passwordMatches || !isUserActive(user.active)) {
    throw new AuthenticationError();
  }

  await updateLastAccess(user.userId);
  const token = createSessionToken();
  await createSession(
    user.userId,
    hashSessionToken(token),
    //config.sessionTtlHours,
    config.sessionTtlMinutes,
    ipAddress,
  );

  return {
    user: toAuthenticatedUser(user),
    token,
  };
}

export async function authenticateSession(token: string): Promise<AuthenticatedUser> {
  const user = await findSessionUser(hashSessionToken(token));
  if (!user) throw new AuthenticationError();
  return user;
}

export async function renewSession(
  token: string,
  ipAddress: string,
): Promise<{ user: AuthenticatedUser; token: string }> {
  const replacementToken = createSessionToken();
  const result = await rotateSession(
    hashSessionToken(token),
    hashSessionToken(replacementToken),
    //config.sessionTtlHours,
    config.sessionTtlMinutes,
    ipAddress,
  );

  if (!result) throw new AuthenticationError();
  return { user: result, token: replacementToken };
}

export async function logout(token: string | undefined): Promise<void> {
  if (token) await revokeSession(hashSessionToken(token));
}

export function isUserActive(active: boolean | number | string): boolean {
  return active === true || active === 1 ||
    (typeof active === "string" && ["1", "true"].includes(active.toLowerCase()));
}

function toAuthenticatedUser(user: {
  userId: AuthenticatedUser["userId"];
  username: string;
  firstName: string | null;
  lastName: string | null;
  roleId: AuthenticatedUser["roleId"];
  role?: AuthenticatedUser["role"];
}): AuthenticatedUser {
  return {
    userId: user.userId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    role: user.role ?? resolveRole(user.roleId),
  };
}

export class AuthenticationError extends Error {
  constructor() {
    super("Usuario o contraseña incorrectos.");
    this.name = "AuthenticationError";
  }
}
