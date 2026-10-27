import type { AuthenticatedUser } from "../modules/auth/auth.types.ts";

//Extiende la interface Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export { };
