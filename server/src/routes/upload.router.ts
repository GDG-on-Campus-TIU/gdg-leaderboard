import { Hono } from "hono";
import { Storage } from "@google-cloud/storage";

const uploadRouter = new Hono();

const storage = new Storage({
  projectId: "light-ratio-453107-r4",
  keyFilename: "credentials.json",
});

const bucket = storage.bucket("leaderboard-pfp");

uploadRouter.post("/pfp", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file) {
    return c.text("No file uploaded", 400);
  }

  // Check if file is a Blob/File type (from multipart form)
  if (file instanceof Blob || (file as any).arrayBuffer) {
    // set the defaults
    const fileBlob = file as Blob;
    const fileType = fileBlob.type || "application/octet-stream";

    // TODO: transform the file name for url friendliness
    let fileName = (file as any).name || `uploaded-file-${Date.now()}`;
    fileName = fileName.replace(/\s+/g, "-"); // Replace spaces with dashes
    fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_"); // Replace special characters
    fileName = fileName.replace(/--+/g, "-"); // Replace multiple dashes with a single dash
    fileName = fileName.replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
    fileName = fileName.replace(/_/g, "-"); // Replace underscores with dashes
    fileName = fileName.toLowerCase(); // Convert to lowercase

    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    // upload that to `pfp` folder
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
      console.error(err);
      return c.text("Upload failed", 500);
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/pfp/${fileName}`;
      return c.json({
        url: publicUrl,
        storageUrl: blob.cloudStorageURI,
      });
    });

    blobStream.end(buffer);

    return c.json(
      {
        message: "File uploaded successfully",
        fileName,
        fileType,
        url: `https://storage.googleapis.com/${bucket.name}/pfp/${fileName}`,
      },
      200
    );
  } else {
    return c.text("Invalid file format", 400);
  }
});

export { uploadRouter };
