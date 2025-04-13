import { Hono } from "hono";
import { authRouter } from "./auth.router";
import { healthRouter } from "./health.route";
import { adminRouter } from "./admin.router";
import { adminAuthGuard } from "../middlewares/authguard.admin";
import { uploadRouter } from "./upload.router";
import { rootRouter } from "./root.router";

const mainRouter = new Hono();

// @INFO This is the main router for the application.
// @TODO Add zod body validator to all the routes

mainRouter.route("/auth", authRouter);
mainRouter.route("/health", healthRouter);

mainRouter.route("/upload", uploadRouter);

// Protecting admin routes
mainRouter.use("/admin/*", adminAuthGuard);
mainRouter.route("/admin", adminRouter);

mainRouter.route("/root", rootRouter);

// @TODO: user routes
// @TODO: leader board routes

export { mainRouter };
