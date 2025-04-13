<<<<<<< HEAD
import { Hono, Context } from "hono";
import { sign, verify } from "hono/jwt";
import { prisma } from "../db/prisma";
import { Utils } from "../utils/hash";
import { log } from "../utils/logger";
import { JWTPayload } from "hono/utils/jwt/types";

const authRouter = new Hono();

// @TODO add zod body validator
authRouter.post("/login", async (c: Context) => {
  try {
    const jwt_payload = c.get("jwt_payload");

    if (jwt_payload && jwt_payload.user_details) {
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
      "HS512"
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

// @TODO add zod body validator
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

    // @INFO Create student first
    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        clgId,
        idCard: `https://storage.googleapis.com/leaderboard-pfp/id_card/${clgId}_id_card.png`,
        password: hashedPassword,
      },
    });

    // @DEMO - how to create and connect relations in Prisma
    //
    // @INFO Create score with relation to student
    // await prisma.score.create({
    //   data: {
    //     assignmentScore: 0,
    //     attendanceScore: 0,
    //     domain: "AIML",
    //     totalScore: 0,
    //     participationScore: 0,
    //     student: {
    //       connect: {
    //         id: newStudent.id,
    //       },
    //     },
    //   },
    // });

    // @INFO Fetch the complete student with score for response
    const studentWithScore = await prisma.student.findUnique({
      where: {
        id: newStudent.id,
      },
      include: {
        score: true,
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
      "HS512"
    );

    return c.json(
      {
        message: "User created successfully!",
        user: studentWithScore,
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

authRouter.get("/me", async (c: Context) => {
  // @INFO Check if the header is there or not
  const jwt_payload = c.req.header("Authorization");
  if (!jwt_payload) {
    return c.text("Unauthorized", 401);
  }

  // @INFO check if the token is there or not
  const token = jwt_payload.split(" ")[1];
  if (!token) {
    return c.text("Invalid Authorization format", 401);
  }

  // @INFO check if the token is valid or not
  type CustomJWTPayload = JWTPayload & {
    user_details: {
      id: string;
      email: string;
    };
  };
  let decodedToken: CustomJWTPayload;
  try {
    decodedToken = (await verify(
      token,
      process.env.JWT_SECRET ?? "demo_pass",
      "HS512"
    )) as CustomJWTPayload;
    if (!decodedToken) {
      return c.text("Invalid token format", 401);
    }
  } catch (error) {
    log.error(`JWT verification error: ${error}`);
    return c.text("Invalid or expired token", 401);
  }

  // @INFO extract the user id from the token
  const { user_details } = decodedToken as CustomJWTPayload;

  const user = await prisma.student.findUnique({
    where: {
      id: user_details.id,
    },
    include: {
      score: true,
      pfp: true,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return c.text("User not found", 404);
  }

  return c.json({
    message: "User details fetched successfully",
    user,
  });
});

export { authRouter };
=======
import { Hono, Context } from "hono";
import { sign, verify } from "hono/jwt";
import { prisma } from "../db/prisma";
import { Utils } from "../utils/hash";
import { log } from "../utils/logger";
import { JWTPayload } from "hono/utils/jwt/types";
import { getEnv } from "../utils/env";

const JWT_SECRET = getEnv("JWT_SECRET") || "demo_pass";

const authRouter = new Hono();

// @TODO add zod body validator
authRouter.post("/login", async (c: Context) => {
  try {
    const jwt_payload = c.get("jwt_payload");

    if (jwt_payload && jwt_payload.user_details) {
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
      JWT_SECRET,
      "HS512"
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

// @TODO add zod body validator
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

    // @INFO Create student first
    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        clgId,
        idCard: `https://storage.googleapis.com/leaderboard-pfp/id_card/${clgId}_id_card.png`,
        password: hashedPassword,
      },
    });

    // @DEMO - how to create and connect relations in Prisma
    //
    // @INFO Create score with relation to student
    // await prisma.score.create({
    //   data: {
    //     assignmentScore: 0,
    //     attendanceScore: 0,
    //     domain: "AIML",
    //     totalScore: 0,
    //     participationScore: 0,
    //     student: {
    //       connect: {
    //         id: newStudent.id,
    //       },
    //     },
    //   },
    // });

    // @INFO Fetch the complete student with score for response
    const studentWithScore = await prisma.student.findUnique({
      where: {
        id: newStudent.id,
      },
      include: {
        score: true,
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
      JWT_SECRET,
      "HS512"
    );

    return c.json(
      {
        message: "User created successfully!",
        user: studentWithScore,
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

authRouter.get("/me", async (c: Context) => {
  // @INFO Check if the header is there or not
  const jwt_payload = c.req.header("Authorization");
  if (!jwt_payload) {
    return c.text("Unauthorized", 401);
  }

  // @INFO check if the token is there or not
  const token = jwt_payload.split(" ")[1];
  if (!token) {
    return c.text("Invalid Authorization format", 401);
  }

  // @INFO check if the token is valid or not
  type CustomJWTPayload = JWTPayload & {
    user_details: {
      id: string;
      email: string;
    };
  };
  let decodedToken: CustomJWTPayload;
  try {
    decodedToken = (await verify(
      token,
      JWT_SECRET,
      "HS512"
    )) as CustomJWTPayload;
    if (!decodedToken) {
      return c.text("Invalid token format", 401);
    }
  } catch (error) {
    log.error(`JWT verification error: ${error}`);
    return c.text("Invalid or expired token", 401);
  }

  // @INFO extract the user id from the token
  const { user_details } = decodedToken as CustomJWTPayload;

  const user = await prisma.student.findUnique({
    where: {
      id: user_details.id,
    },
    include: {
      score: true,
      pfp: true,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return c.text("User not found", 404);
  }

  return c.json({
    message: "User details fetched successfully",
    user,
  });
});

export { authRouter };
>>>>>>> 1bcc234c578f82fb7578181fb457d74e32a5fe49
