import { Context, Hono } from "hono";
import { log } from "../utils/logger";

const healthRouter = new Hono();

healthRouter.get("/", (c: Context) => {
  log.info("Health check endpoint hit");
  return c.json(
    {
      status: "ok",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    },
    200
  );
});

export { healthRouter };
