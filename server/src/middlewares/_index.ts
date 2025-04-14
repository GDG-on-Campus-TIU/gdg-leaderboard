import { adminGuard, authGuard } from "./authguard";
import { parseIdHeaders } from "./header-parser";

/**
 * Middleware function to guard admin routes.
 * It checks if the request has a valid JWT token in the Authorization header.
 */
export const Middlewares = {
  authGuard,
  adminGuard,
  parseIdHeaders,
};
