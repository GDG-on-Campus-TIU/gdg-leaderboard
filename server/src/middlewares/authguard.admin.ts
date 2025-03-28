import { Context, Next } from "hono";
import { decode, verify } from "hono/jwt";

/**
 * Middleware function to guard admin routes.
 * It checks if the request has a valid JWT token in the Authorization header.
 * @param c {Context} This is the context object that contains the request and response objects.
 * @param next {Next} This is the next middleware function to be called.
 *
 * @example
 * ```bash
 * curl -X GET http://localhost:3000/api/v1/admin \
 *      -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
 * ```
 *
 * @returns {Promise<Response|void>} Returns a response with error message if unauthorized,
 * or proceeds to the next middleware if authentication succeeds.
 */
export const adminAuthGuard = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  if (token !== process.env.ADMIN_TOKEN) {
    return c.text("Forbidden", 403);
  }

  const decodedToken = decode(token);
  if (!decodedToken) {
    return c.text("Invalid token", 401);
  }

  const verifiedToken = await verify(
    token,
    process.env.JWT_SECRET ?? "demo_pass"
  );
  if (!verifiedToken) {
    return c.text("Invalid token", 401);
  }

  const user = c.set("jwt_payload", verifiedToken);

  return next();
};
