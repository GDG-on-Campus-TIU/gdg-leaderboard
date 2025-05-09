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

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "gdgoctiu-bucket");

paymentRouter.post("/upload", async (c: Context) => {
  const body = await c.req.parseBody();
  const { ss, name, phone, email, upiId, products, totalAmount, specialName } =
    body;

  if (
    !ss ||
    !name ||
    !phone ||
    !email ||
    !upiId ||
    !totalAmount ||
    !products ||
    !specialName
  ) {
    return c.text("Missing required fields", 400);
  }

  const items = products.toString().split(",");
  const productsList = items.map((i: string) => {
    const [name, size, quantity] = i.split(":");
    return {
      name: name.trim(),
      size: size.trim(),
      quantity: Number(quantity.trim()),
    };
  });

  try {
    if (ss instanceof Blob || (ss as any).arrayBuffer) {
      const file = ss as Blob;
      const type = file.type || "application/octet-stream";
      const requestId = uuid();

      let fileName = (ss as any).name || `uploaded-file-${Date.now()}`;
      const [_, ext] = fileName.split(".");

      fileName = `${
        name
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-")
      }_${requestId.toString()}_ss.${ext}`;

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

      const publicUrl =
        `https://storage.googleapis.com/${bucket.name}/payment_ss/${fileName}`;

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
            specialName: String(specialName) ?? "NONE",
            items,
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

paymentRouter.get("/find", async (c: Context) => {
  const query = c.req.query();
  const { orderId, name, email, upiId, phone } = query;

  // At least one of the fields must be provided
  if (!orderId && !name && !email && !upiId && !phone) {
    return c.text(
      "At least one of orderId, name, email, upiId, or phone is required",
      400,
    );
  }

  const payment = await prisma.merchPayments.findMany({
    where: {
      OR: [
        { orderId: orderId as string },
        { email: { contains: email as string, mode: "insensitive" } },
        { upiId: { contains: upiId as string, mode: "insensitive" } },
        { name: { contains: name as string, mode: "insensitive" } },
        { phone: { contains: phone as string, mode: "insensitive" } },
      ],
    },
  });

  if (!payment || payment.length === 0) {
    return c.text("Payment not found", 404);
  }

  return c.json({
    message: "Payment found",
    status: 200,
    data: payment,
  });
});

paymentRouter.get("/all", async (c: Context) => {
  const take = c.req.query("t");
  const cursor = c.req.query("c");

  const payments = await prisma.merchPayments.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: take ? Number(take) : 10,
    skip: cursor ? Number(cursor) : 0,
  });

  if (!payments || payments.length === 0) {
    return c.text("No payments found", 404);
  }

  return c.json({
    message: "Payments found",
    status: 200,
    data: payments,
  });
});

export { paymentRouter };
