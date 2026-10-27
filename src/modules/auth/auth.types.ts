import type { UserRole } from "../../config/env.ts";

export type UserId = number | string;

export interface AuthenticatedUser {
  userId: UserId;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number | string | null;
  role: UserRole | null;
}

export interface UserWithPassword {
  userId: UserId;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number | string | null;
  passwordHash: string;
  active: boolean | number | string;
}
