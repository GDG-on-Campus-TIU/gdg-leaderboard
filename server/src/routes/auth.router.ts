import { Hono, Context } from "hono";
import { sign } from "hono/jwt"

const authRouter = new Hono();

authRouter.post("/login", async (c: Context) => {
  const jwt_payload = c.get("jwt_payload")

  if (jwt_payload.user_details) {
    // TODO: make changes to refresh the expiry of the token here
    c.json({
      message: "Already logged in!"
    }, 201)
    return
  }

  const { email, password } = await c.req.json<{ email: string; password: string; }>()

  if (!email || !password) {
    c.json({
      message: "Missing required field, email and password must be sent!"
    }, 400)
    return
  }


})

export { authRouter };
