import { createHash, randomBytes } from "node:crypto";

//Genera un token de sesion aleatorio de 32 bytes
export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

//Genera el hash del token de sesion
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
