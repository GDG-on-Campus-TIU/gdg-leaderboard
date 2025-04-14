<<<<<<< HEAD
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
=======
import { Context, Hono } from "hono";
import { Utils } from "../utils/hash";
import { prisma } from "../db/prisma";
import { jwt, sign } from "hono/jwt";
import { log } from "../utils/logger";
import { getEnv } from "../utils/env";
import { Middlewares } from "../middlewares/_index";

const domains = [
  "CLOUD",
  "AIML",
  "BLOCKCHAIN",
  "DEVOPS",
  "DSA",
  "WEB",
  "ANDROID",
  "IOT",
  "CYBERSECURITY",
];
const JWT_SECRET = getEnv("JWT_SECRET") || "demo_pass";

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
        JWT_SECRET,
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

// @TODO try to figure out whether this is usable or not
adminRouter.post("/add-score", async (c: Context) => {});

adminRouter.post(
  "/update-score",
  Middlewares.parseIdHeaders,
  async (c: Context) => {
    log.info("Updating score for user");
    const adminDetails = c.get("admin_details");
    if (!adminDetails) {
      return c.json(
        {
          message: "Admin details not found!",
        },
        404
      );
    }

    log.info(`Admin details: ${JSON.stringify(adminDetails, null, 2)}`);
    const [student_id, clgId] = [c.get("student_id"), c.get("clgId")];

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: student_id }, { clgId: clgId }],
      },
    });
    if (!student) {
      return c.json(
        {
          message: "Student not found!",
        },
        404
      );
    }

    const { domain, attendance_score, participation_score, assignment_score } =
      await c.req.json<{
        domain: string;
        attendance_score: number;
        participation_score: number;
        assignment_score: number;
      }>();

    if (!domains.includes(domain)) {
      return c.json(
        {
          message: "Invalid domain provided!",
        },
        400
      );
    }

    if (
      !domain ||
      !attendance_score ||
      !participation_score ||
      !assignment_score
    ) {
      return c.json(
        {
          message:
            "Missing required field, domain, attendance_score, participation_score and assignment_score must be sent!",
        },
        400
      );
    }

    const score = await prisma.score.findFirst({
      where: {
        OR: [{ student: { clgId: clgId } }, { student: { id: student_id } }],
        domain: domain as any, // Type cast as any to ensure compatibility
      },
      include: {
        student: true,
      },
    });

    if (!score) {
      return c.json(
        {
          message: "Score not found for the specified domain!",
        },
        404
      );
    }

    score.attendanceScore = attendance_score;
    score.participationScore = participation_score;
    score.assignmentScore = assignment_score;
    score.totalScore =
      attendance_score + participation_score + assignment_score;

    const { student: s, ...scoreWOStudent } = score;

    await prisma.score.update({
      where: { id: score.id },
      data: {
        ...scoreWOStudent,
      },
    });

    return c.json(
      {
        message: "Score updated successfully!",
        score,
      },
      200
    );
  }
);

adminRouter.post(
  "/generate-defaults",
  Middlewares.parseIdHeaders,
  async (c: Context) => {
    // @INFO: This will
    // 1. Generate default scores for either selected users or all users

    log.info("Generating default scores for all users");
    const adminDetails = c.get("admin_details");
    if (!adminDetails) {
      return c.json(
        {
          message: "Admin details not found!",
        },
        404
      );
    }

    log.info(`Admin details: ${JSON.stringify(adminDetails, null, 2)}`);

    const [student_id, clgId] = [c.get("student_id"), c.get("clgId")];

    // Check if the student exists
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: student_id }, { clgId: clgId }],
      },
    });
    if (!student) {
      return c.json(
        {
          message: "Student not found!",
        },
        404
      );
    }

    // First check which domains the student already has scores for
    const existingScores = await prisma.score.findMany({
      where: {
        studentId: student_id,
      },
      select: {
        domain: true,
      },
    });

    const existingDomains = new Set(
      existingScores.map((score) => score.domain)
    );

    // Create promises array for domains that don't exist yet
    const scorePromises = domains.map(async (domain) => {
      if (!existingDomains.has(domain as any)) {
        return prisma.score.create({
          data: {
            assignmentScore: 0,
            attendanceScore: 0,
            domain: domain as any, // Type cast to match the Domain enum
            totalScore: 0,
            participationScore: 0,
            student: {
              connect: {
                id: student_id,
              },
            },
          },
        });
      }
      return Promise.resolve(); // Return resolved promise for existing scores
    });

    try {
      await Promise.all(scorePromises);

      return c.json(
        {
          message: "Default scores setup successfully!",
          created: domains.filter(
            (domain) => !existingDomains.has(domain as any)
          ),
          skipped: [...Array.from(existingDomains)],
        },
        200
      );
    } catch (error) {
      log.error(`Error creating default scores: ${error}`);
      return c.json(
        {
          message: "Error creating default scores",
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

export { adminRouter };
>>>>>>> 1bcc234c578f82fb7578181fb457d74e32a5fe49
