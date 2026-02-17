import type { Context } from "elysia";
import type { Logestic } from "logestic";
import type { UserWithoutPassword } from "./auth";

export interface BaseContext extends Context {
  logestic: Logestic;
  requestId: string;
}

export interface ExtendedContext<TBody = unknown> extends BaseContext {
  body: TBody;
  ip?: string;
  userAgent?: string;
}

export interface AuthenticatedContext<TBody = unknown>
  extends ExtendedContext<TBody> {
  user: UserWithoutPassword;
}
