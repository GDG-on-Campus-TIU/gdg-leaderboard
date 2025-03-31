import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { prometheus } from "@hono/prometheus";

import { mainRouter } from "./routes/_index";
import { log } from "./utils/logger";
import { prisma } from "./db/prisma";

// ----------------------------------------------
// Constants setups
const { printMetrics, registerMetrics } = prometheus();
const app = new Hono();
const API_VER = process.env.API_VER || "/api/v1";

// ----------------------------------------------
//Middlewares setup
app.use(prettyJSON());
app.use(
  logger((msg, ...rest) => {
    log.http(msg, ...rest);
  })
);
app.use(
  "*",
  cors({
    origin: ["localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use("*", registerMetrics);

// ----------------------------------------------
// Route handlers setup
app.route(API_VER, mainRouter);

//metrics setup
app.get(`${API_VER}/metrics`, printMetrics);

// ----------------------------------------------
// Error handling setup
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found.",
    },
    404
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
    500
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
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
