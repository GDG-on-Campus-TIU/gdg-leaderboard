const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

// Path to the credentials file
const credentialsPath = path.resolve(__dirname, "../credentials.json");

console.log("Checking if credentials file exists:", credentialsPath);
if (fs.existsSync(credentialsPath)) {
  console.log("✅ Credentials file found");
} else {
  console.error("❌ Credentials file not found at:", credentialsPath);
  process.exit(1);
}

console.log("Checking if credentials file is valid JSON...");
try {
  const credentialsContent = fs.readFileSync(credentialsPath, "utf8");
  JSON.parse(credentialsContent);
  console.log("✅ Credentials file contains valid JSON");
} catch (error) {
  console.error("❌ Credentials file contains invalid JSON:", error.message);
  process.exit(1);
}

// Try to initialize the storage client
console.log("Testing GCP Storage authentication...");
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || "light-ratio-453107-r4",
  keyFilename: credentialsPath,
});

// Test connection by listing buckets
async function testConnection() {
  try {
    const [buckets] = await storage.getBuckets();
    console.log("✅ Successfully authenticated with GCP");
    console.log("Available buckets:");
    buckets.forEach((bucket) => {
      console.log(`- ${bucket.name}`);
    });

    // Try to access the specific bucket
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "gdgoctiu-bucket");
    const [exists] = await bucket.exists();

    if (exists) {
      console.log('✅ Successfully connected to "gdgoctiu-bucket" bucket');
    } else {
      console.error(
        '❌ Bucket "gdgoctiu-bucket" does not exist or you do not have access'
      );
    }
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    process.exit(1);
  }
}

testConnection();
