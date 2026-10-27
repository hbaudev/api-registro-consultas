import { asRecord } from "../../utils/global-validations.ts";

export interface LoginInput {
  username: string;
  password: string;
}

export function parseLoginInput(body: unknown): LoginInput | undefined {
  const record = asRecord(body);
  if (!record) return undefined;
  const { username, password } = record;

  if (
    typeof username !== "string" ||
    username.trim().length === 0 ||
    username.trim().length > 50 ||
    typeof password !== "string" ||
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return undefined;
  }

  return { username: username.trim(), password };
}
