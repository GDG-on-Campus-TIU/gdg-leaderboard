import { Context, Next } from "hono";
import { decode, verify } from "hono/jwt";
import { log } from "../utils/logger";

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
 * @returns { Promise<Response | void> } Returns a response with error message if unauthorized,
 * or proceeds to the next middleware if authentication succeeds.
 */
export const adminAuthGuard = async (c: Context, next: Next) => {
  // @INFO: check if the request is originating for the root route, if yes then allow it
  if (
    c.req.query("root_email") === process.env.ROOT_EMAIL &&
    c.req.query("root_password") === process.env.ROOT_PASSWORD
  ) {
    // Allow access if the root email is provided
    return next();
  }

  // @INFO: check if the request is originating for the login route, if yes then allow it
  if (c.req.path.split("/").includes("login")) {
    return next();
  }

  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.text("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return c.text("Invalid Authorization format", 401);
    }

    // Check if it's a direct admin token
    if (token === process.env.ADMIN_TOKEN) {
      // Allow access with admin token
      return next();
    }

    const decodedToken = decode(token);
    if (!decodedToken) {
      return c.text("Invalid token format", 401);
    }

    try {
      // Verify the token using HS256 algorithm
      const verifiedToken = await verify(
        token,
        process.env.JWT_SECRET ?? "demo_pass",
        "HS512"
      );

      c.set("jwt_payload", verifiedToken);
      return next();
    } catch (error) {
      log.error(`JWT verification error: ${error}`);
      return c.text("Invalid or expired token", 401);
    }
  } catch (error) {
    log.error(`Auth guard error: ${error}`);
    return c.text("Authentication error", 500);
  }
};
