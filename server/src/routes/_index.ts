<<<<<<< HEAD
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
=======
import { Hono } from "hono";
import { authRouter } from "./auth.router";
import { healthRouter } from "./health.route";
import { adminRouter } from "./admin.router";
import { uploadRouter } from "./upload.router";
import { rootRouter } from "./root.router";
import { Middlewares } from "../middlewares/_index";

const mainRouter = new Hono();

// @INFO This is the main router for the application.
// @TODO Add zod body validator to all the routes

mainRouter.route("/auth", authRouter);
mainRouter.route("/health", healthRouter);

mainRouter.route("/upload", uploadRouter);

// Protecting admin routes
mainRouter.use("/admin/*", Middlewares.adminGuard);
mainRouter.route("/admin", adminRouter);

mainRouter.route("/root", rootRouter);

// @TODO: user routes
// @TODO: leader board routes

export { mainRouter };
>>>>>>> 04efd2fdcd4d5e6745e97c1d3978c52e38c4cc61
