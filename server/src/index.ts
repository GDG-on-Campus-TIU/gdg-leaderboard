import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { prometheus } from "@hono/prometheus";

import { mainRouter } from "./routes/_index";
import { log } from "./utils/logger";

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
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500
  );
});

// ----------------------------------------------
export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
