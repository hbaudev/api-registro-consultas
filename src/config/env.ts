import "dotenv/config";

type SameSite = "lax" | "strict" | "none";
export type UserRole = "Administrador" | "Admisionista" | "Medico/a" | "Enfermero/a";

function parseInteger(name: string, value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${name} debe ser un número entero.`);
  }
  return parsed;
}

function parseBoolean(name: string, value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  throw new Error(`${name} debe ser "true" o "false".`);
}

function parseClientOrigins(value: string | undefined, production: boolean): string[] {
  const origins = (value ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CLIENT_ORIGINS debe contener al menos un origen.");
  }

  return origins.map((origin) => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`CLIENT_ORIGINS contiene un origen inválido: ${origin}`);
    }

    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error(`CLIENT_ORIGINS debe contener solo orígenes sin rutas: ${origin}`);
    }
    if (production && parsed.protocol !== "https:") {
      throw new Error(`CLIENT_ORIGINS debe usar HTTPS en producción: ${origin}`);
    }

    return parsed.origin;
  });
}

function parseSameSite(value: string | undefined): SameSite {
  const sameSite = (value ?? "lax").toLowerCase();
  if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") return sameSite;
  throw new Error("SESSION_COOKIE_SAME_SITE debe ser lax, strict o none.");
}

function parseRoleId(name: string, value: string | undefined, fallback: number): number {
  const roleId = parseInteger(name, value, fallback);
  if (roleId < 1) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
  return roleId;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error("NODE_ENV debe ser development, test o production.");
}

const port = parseInteger("PORT", process.env.PORT, 3000);
if (port < 1 || port > 65535) {
  throw new Error("PORT debe estar entre 1 y 65535.");
}

const trustProxyHops = parseInteger("TRUST_PROXY_HOPS", process.env.TRUST_PROXY_HOPS, 0);
if (trustProxyHops < 0) {
  throw new Error("TRUST_PROXY_HOPS debe ser un entero no negativo.");
}

const sessionTtlMinutes = parseInteger("SESSION_TTL_MINUTES", process.env.SESSION_TTL_MINUTES, 480);
if (sessionTtlMinutes < 1 || sessionTtlMinutes > 43200) {
  throw new Error("SESSION_TTL_MINUTES debe estar entre 1 y 43200.");
}

// const sessionTtlHours = parseInteger("SESSION_TTL_HOURS", process.env.SESSION_TTL_HOURS, 8);
// if (sessionTtlHours < 1 || sessionTtlHours > 720) {
//   throw new Error("SESSION_TTL_HOURS debe estar entre 1 y 720.");
// }

const sessionRenewAfterMinutes = parseInteger("SESSION_RENEW_AFTER_MINUTES", process.env.SESSION_RENEW_AFTER_MINUTES, 60);
if (sessionRenewAfterMinutes < 1 || sessionRenewAfterMinutes >= sessionTtlMinutes) {
  throw new Error("SESSION_RENEW_AFTER_MINUTES debe ser al menos 1 y menor que SESSION_TTL_MINUTES.");
}

// const sessionRenewAfterHours = parseInteger(
//   "SESSION_RENEW_AFTER_HOURS",
//   process.env.SESSION_RENEW_AFTER_HOURS,
//   1,
// );
// if (sessionRenewAfterHours < 1 || sessionRenewAfterHours >= sessionTtlHours) {
//   throw new Error("SESSION_RENEW_AFTER_HOURS debe ser al menos 1 y menor que SESSION_TTL_HOURS.");
// }

const sameSite = parseSameSite(process.env.SESSION_COOKIE_SAME_SITE);
const secureCookie = parseBoolean(
  "SESSION_COOKIE_SECURE",
  process.env.SESSION_COOKIE_SECURE,
  nodeEnv === "production",
);

if (nodeEnv === "production" && !secureCookie) {
  throw new Error("SESSION_COOKIE_SECURE debe ser true en producción.");
}
if (sameSite === "none" && !secureCookie) {
  throw new Error("SESSION_COOKIE_SECURE debe ser true cuando SameSite es none.");
}

const roleIds: Record<UserRole, number> = {
  Administrador: parseRoleId("ROLE_ADMIN_ID", process.env.ROLE_ADMIN_ID, 1),
  Admisionista: parseRoleId("ROLE_ADMISSION_ID", process.env.ROLE_ADMISSION_ID, 2),
  "Medico/a": parseRoleId("ROLE_DOCTOR_ID", process.env.ROLE_DOCTOR_ID, 3),
  "Enfermero/a": parseRoleId("ROLE_NURSE_ID", process.env.ROLE_NURSE_ID, 4),
};
if (new Set(Object.values(roleIds)).size !== Object.keys(roleIds).length) {
  throw new Error("Los IDs configurados para los cuatro roles deben ser distintos.");
}

export const config = {
  nodeEnv,
  port,
  trustProxyHops,
  clientOrigins: parseClientOrigins(process.env.CLIENT_ORIGINS, nodeEnv === "production"),
  trustedOrigins: [
    ...parseClientOrigins(process.env.CLIENT_ORIGINS, nodeEnv === "production"),
    ...(nodeEnv === "production"
      ? []
      : [`http://localhost:${port}`, `http://127.0.0.1:${port}`]),
  ],
  sessionTtlMinutes,
  sessionRenewAfterMinutes,
  roleIds,
  sessionCookie: {
    name: nodeEnv === "production" ? "__Host-session" : "session",
    secure: secureCookie,
    sameSite,
  },
} as const;

export function resolveRole(roleId: number | string | null): UserRole | null {
  if (roleId === null) return null;
  const numericRoleId = Number(roleId);
  if (numericRoleId === roleIds.Administrador) return "Administrador";
  if (numericRoleId === roleIds.Admisionista) return "Admisionista";
  if (numericRoleId === roleIds["Medico/a"]) return "Medico/a";
  if (numericRoleId === roleIds["Enfermero/a"]) return "Enfermero/a";
  return null;
}
