import { Hono, Context } from "hono";
import { sign } from "hono/jwt";
import { prisma } from "../db/prisma";
import { Utils } from "../utils/hash";
import { log } from "../utils/logger";

const authRouter = new Hono();

authRouter.post("/login", async (c: Context) => {
  try {
    const jwt_payload = c.get("jwt_payload");

    if (jwt_payload && jwt_payload.user_details) {
      // TODO: make changes to refresh the expiry of the token here
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

    const user = await prisma.student.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return c.json(
        {
          message: "User not found!",
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

    // INFO: Generate a new token and sign it
    const token = await sign(
      {
        user_details: {
          id: user.id,
          email: user.email,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      process.env.JWT_SECRET ?? "demo_pass",
      "HS256"
    );

    return c.json(
      {
        message: "Login successful!",
        token,
      },
      200
    );
  } catch (error) {
    log.error(`Login error: ${error}`);
    return c.json(
      {
        message: "Error during login process",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

authRouter.post("/signup", async (c: Context) => {
  try {
    const { name, email, password, clgId } = await c.req.json<{
      name: string;
      email: string;
      password: string;
      clgId: string;
    }>();

    if (!name || !email || !password || !clgId) {
      return c.json(
        {
          message:
            "Missing required field, `name`, `email`, `clgId` and `password` must be sent!",
        },
        400
      );
    }

    const user = await prisma.student.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return c.json(
        {
          message: "User already exists!",
        },
        409
      );
    }

    const hashedPassword = await Utils.hashPassword(password);

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        clgId,
        password: hashedPassword,
      },
    });

    const token = await sign(
      {
        user_details: {
          id: newStudent.id,
          email: newStudent.email,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      process.env.JWT_SECRET ?? "demo_pass",
      "HS256" // Changed from RS512 to HS256
    );

    return c.json(
      {
        message: "User created successfully!",
        user: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          clgId: newStudent.clgId,
        },
        token,
      },
      201
    );
  } catch (error) {
    log.error(`Signup error: ${error}`);
    return c.json(
      {
        message: "Error during signup process",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export { authRouter };
