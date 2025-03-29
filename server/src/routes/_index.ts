import { Hono } from "hono";
import { authRouter } from "./auth.router";
import { healthRouter } from "./health.route";
import { adminRouter } from "./admin.router";
import { adminAuthGuard } from "../middlewares/authguard.admin";

const mainRouter = new Hono();

mainRouter.route("/auth", authRouter);
mainRouter.route("/health", healthRouter);

// Protecting admin routes
mainRouter.use("/admin/*", adminAuthGuard);
mainRouter.route("/admin", adminRouter);

// TODO: user routes
// TODO: leader board routes

export { mainRouter };
