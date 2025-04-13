import { Hono } from "hono";
import { prisma } from "../db/prisma";
import { Utils } from "../utils/hash";

const rootRouter = new Hono();

rootRouter.post("/create-id", async (c) => {
  if (
    !(c.req.query("root_email") === process.env.ROOT_EMAIL) &&
    !(c.req.query("root_password") === process.env.ROOT_PASSWORD)
  ) {
    // Allow access if the root email is provided
    return c.text("Unauthorized", 401);
  }
  const { name, email, password } = await c.req.json<{
    name: string;
    email: string;
    password: string;
  }>();
  if (!name || !email || !password) {
    return c.json(
      {
        message:
          "Missing required field, `name`, `email` and `password` must be sent!",
      },
      400
    );
  }
  const user = await prisma.admin.findFirst({
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
  const newAdmin = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  if (!newAdmin) {
    return c.json(
      {
        message: "Error creating user!",
      },
      500
    );
  }
  return c.json(
    {
      message: "User created successfully!",
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    },
    201
  );
});

export { rootRouter };
