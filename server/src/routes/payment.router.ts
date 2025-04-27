import { Bucket, Storage } from "@google-cloud/storage";
import { Hono } from "hono";
import { Context } from "hono";
import { v4 as uuid } from "uuid";
import { log } from "../utils/logger";
import { MerchPayments } from "@prisma/client";
import { prisma } from "../db/prisma";

const paymentRouter = new Hono();

let storage: Storage;
if (process.env.CLOUD_RUN_ENV === "yes") {
  storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
  });
} else {
  storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID || "light-ratio-453107-r4",
    keyFilename: "credentials.json",
  });
}

const bucket = storage.bucket("leaderboard-pfp");

paymentRouter.post("/", async (c: Context) => {
  const body = await c.req.parseBody();
  const { ss, name, phone, email, upiId, products, totalAmount } = body;

  if (!ss || !name || !phone || !email || !upiId || !totalAmount || !products) {
    return c.text("Missing required fields", 400);
  }

  try {
    if (ss instanceof Blob || (ss as any).arrayBuffer) {
      const file = ss as Blob;
      const type = file.type || "application/octet-stream";
      const requestId = uuid();

      let fileName = (ss as any).name || `uploaded-file-${Date.now()}`;
      const [_, ext] = fileName.split(".");

      fileName = `${name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")}_${requestId.toString()}_ss.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const blob = bucket.file(`payment_ss/${fileName}`);
      const blobStream = blob.createWriteStream({
        resumable: true,
        gzip: true,
        metadata: {
          contentType: type,
          name: `payment_ss/${fileName}`,
        },
      });

      blobStream.on("error", (err) => {
        log.error(err);
        return c.text("Upload failed", 500);
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/payment_ss/${fileName}`;

      blobStream.on("finish", async () => {
        return c.json({
          publicUrl,
          message: "File uploaded successfully",
          status: 201,
          url: publicUrl,
          name,
          phone,
          email,
          upiId,
          data: null,
        });
      });

      blobStream.end(buffer);

      let payment: MerchPayments;
      try {
        payment = await prisma.merchPayments.create({
          data: {
            name: name as string,
            phone: phone as string,
            email: email as string,
            upiId: upiId as string,
            confirmationSS: publicUrl,
            amount: Number(totalAmount),
            orderId: requestId,
            status: "CONFIRMED",
          },
        });
      } catch (error) {
        log.error(error);
        return c.text("Database upload failed", 500);
      }

      return c.json({
        message: "File uploaded successfully",
        status: 200,
        data: payment,
      });
    }
  } catch (error) {
    log.error(error);
    return c.text("Error uploading file", 500);
  }
});

export { paymentRouter };
