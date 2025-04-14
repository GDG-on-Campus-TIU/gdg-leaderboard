import { Hono } from "hono";
import { Storage } from "@google-cloud/storage";
import { Pfp } from "@prisma/client";
import { prisma } from "../db/prisma";
import { log } from "../utils/logger";

const uploadRouter = new Hono();

// Initialize storage without depending on a file
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

uploadRouter.post("/pfp", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const clgId = body["clg_id"];

  // @INFO check if the file is provided
  if (!file) {
    return c.text("No file uploaded", 400);
  }

  // @INFO check if the clg_id is provided
  if (!clgId || typeof clgId !== "string") {
    return c.text("No clg_id provided", 400);
  }

  // @INFO if there is already a pfp for the user, then return the previous one url
  const existingPfp = await prisma.pfp.findFirst({
    where: {
      student: {
        clgId: clgId,
      },
    },
  });

  if (existingPfp) {
    return c.json(
      {
        message: "File upload skipped, previous pfp exists",
        url: existingPfp.url,
      },
      200
    );
  }

  // @INFO Check if file is a Blob/File type (from multipart form)
  if (file instanceof Blob || (file as any).arrayBuffer) {
    // set the defaults
    const fileBlob = file as Blob;
    const fileType = fileBlob.type || "application/octet-stream";

    // @TODO transform the file name for url friendliness
    let fileName = (file as any).name || `uploaded-file-${Date.now()}`;
    let ext = fileName.split(".").pop() || "jpg"; // Get the file extension
    fileName = fileName.replace(/\s+/g, "-"); // Replace spaces with dashes
    fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_"); // Replace special characters
    fileName = fileName.replace(/--+/g, "-"); // Replace multiple dashes with a single dash
    fileName = fileName.replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
    fileName = fileName.replace(/_/g, "-"); // Replace underscores with dashes
    fileName = fileName.toLowerCase(); // Convert to lowercase

    [fileName, ext] = fileName.split(".");
    fileName = `${fileName}-${clgId}-${Date.now()}.${ext}`; // Append timestamp to avoid collisions

    log.info(`Transformed file name: ${fileName}`);

    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    // @INFO upload that to `pfp` folder
    const blob = bucket.file(`pfp/${fileName}`);

    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
      metadata: {
        contentType: fileType,
        name: `pfp/${fileName}`,
      },
    });

    blobStream.on("error", (err) => {
      log.error(err);
      return c.text("Upload failed", 500);
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/pfp/${fileName}`;
      return c.json({
        url: publicUrl,
        storageUrl: blob.cloudStorageURI,
        message: "Upload completed successfully",
      });
    });

    blobStream.end(buffer);

    // @INFO create a new pfp entry in the database
    let uploadedFile: Pfp;
    try {
      uploadedFile = await prisma.pfp.create({
        data: {
          url: `https://storage.googleapis.com/${bucket.name}/pfp/${fileName}`,
          student: {
            connect: {
              clgId: clgId,
            },
          },
        },
        include: {
          student: true,
        },
      });
    } catch (error) {
      log.error(error);
      return c.text("Database upload failed", 500);
    }

    log.info(`File uploaded successfully: ${fileName}`);

    return c.json(
      {
        message: "File uploaded successfully",
        fileName,
        fileType,
        url: `https://storage.googleapis.com/${bucket.name}/pfp/${fileName}`,
        details: uploadedFile,
      },
      200
    );
  } else {
    return c.text("Invalid file format", 400);
  }
});

export { uploadRouter };
