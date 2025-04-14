import { Context, Next } from "hono";

export const parseIdHeaders = async (c: Context, next: Next) => {
  const { student_id, clgId } = await c.req.json<{
    student_id: string;
    clgId: string;
  }>();

  if (!student_id && !clgId) {
    return c.json(
      {
        message: "Missing required field, student_id or clgId must be sent!",
      },
      400
    );
  }

  c.set("student_id", student_id);
  c.set("clgId", clgId);

  return next();
};
