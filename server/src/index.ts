import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { getEnv } from "./utils/env";

// import { prometheus } from "@hono/prometheus";

import { mainRouter } from "./routes/_index";
import { log } from "./utils/logger";
import { prisma } from "./db/prisma";

// ----------------------------------------------
// Constants setups
// const { printMetrics, registerMetrics } = prometheus();
const app = new Hono();
const API_VER = getEnv("API_VER") || "/api/v1";
const PORT = getEnv("PORT") || 3000;
const METRICS_PORT = getEnv("METRICS_PORT") || 9090;

// Update other environment variables
const JWT_SECRET = getEnv("JWT_SECRET");
const DATABASE_URL = getEnv("DATABASE_URL");
const ROOT_EMAIL = getEnv("ROOT_EMAIL");
const ROOT_PASSWORD = getEnv("ROOT_PASSWORD");
const GCP_PROJECT_ID = getEnv("GCP_PROJECT_ID");

// ----------------------------------------------
//Middlewares setup
app.use(prettyJSON());
app.use(
  logger((msg, ...rest) => {
    log.http(msg, ...rest);
  }),
);
app.use(
  cors({
    origin: (origin) => {
      if (!origin) return null;

      const allowedLocalOrigins = [
        "http://localhost:3001",
        "http://localhost:5173",
      ];
      const allowedBaseDomain = "gdgtiu.dev";

      const isLocal = allowedLocalOrigins.includes(origin);
      const isGdgtiuSubdomain = origin.endsWith(`.${allowedBaseDomain}`) ||
        origin === `https://${allowedBaseDomain}`;

      if (isLocal || isGdgtiuSubdomain) {
        return origin; // allow this origin
      }

      return null; // block others
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ----------------------------------------------
// Route handlers setup
app.route(API_VER, mainRouter);

//metrics setup
// app.get("/api/v1/metrics", printMetrics); // Expose metrics at the root level

// ----------------------------------------------
// Error handling setup
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found.",
    },
    404,
  );
});

app.onError((err, c) => {
  log.error(`${err}`);
  log.error("Stack: ", err.stack);
  prisma.$disconnect();
  log.error("Disconnected from DB");
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500,
  );
});

process.on("SIGINT", async () => {
  log.info("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  log.info("Disconnected from DB");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  log.info("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  log.info("Disconnected from DB");
  process.exit(0);
});

process.on("uncaughtException", async (err) => {
  log.error("Uncaught Exception: ", err);
  await prisma.$disconnect();
  log.error("Disconnected from DB");
});

process.on("unhandledRejection", async (reason) => {
  log.error("Unhandled Rejection: ", reason);
  await prisma.$disconnect();
  log.error("Disconnected from DB");
});

// ----------------------------------------------
export default {
  port: PORT,
  fetch: app.fetch,
};
