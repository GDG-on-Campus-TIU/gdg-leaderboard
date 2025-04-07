import { Context, Hono } from "hono";
import { Utils } from "../utils/hash";
import { prisma } from "../db/prisma";
import { jwt, sign } from "hono/jwt";
import { log } from "../utils/logger";

const adminRouter = new Hono();

adminRouter.post("/login", async (c: Context) => {
  try {
    const jwt_payload = c.get("jwt_payload");

    if (jwt_payload && jwt_payload.admin_details) {
      // @TODO: make changes to refresh the expiry of the token here
      return c.json(
        {
          message: "Already logged in!",
        },
        201
      );
    }

    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    if (!email || !password) {
      return c.json(
        {
          message: "Missing required field, email and password must be sent!",
        },
        400
      );
    }

    const user = await prisma.admin.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return c.json(
        {
          message: "Admin not found!",
        },
        404
      );
    }

    // INFO: Check if the password is correct
    if (!(await Utils.comparePassword(password, user.password))) {
      return c.json(
        {
          message: "Invalid credentials!",
        },
        401
      );
    }

    let token: string | null = null;
    try {
      token = await sign(
        {
          admin_details: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
          iat: Math.floor(Date.now() / 1000), // Issued at
        },
        process.env.JWT_SECRET ?? "demo_pass",
        "HS512"
      );
    } catch (error) {
      log.error(`Token signing error: ${error}`);
      return c.json(
        {
          message: "Error generating token",
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }

    return c.json(
      {
        message: "Logged in successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      200
    );
  } catch (error) {
    log.error(`Admin Login error: ${error}`);
    return c.json(
      {
        message: "Error during login process",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

// @INFO this should receive user details like email or user id or college id to identify the user and create scoring for that user
adminRouter.post("/add-score", async (c: Context) => {});
adminRouter.post("/update-score", async (c: Context) => {});

export { adminRouter };
