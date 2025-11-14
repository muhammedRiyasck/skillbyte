import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
export const s3 = new S3Client({
  endpoint: "https://s3.us-east-005.backblazeb2.com", 
  region: "us-east-005",
  credentials: {
    accessKeyId: process.env.B2_S3_KEY_ID!,
    secretAccessKey: process.env.B2_S3_SECRET!,
  },
});

export async function updateCors() {
  const bucketName = "skillbyte-courses";

  const corsConfig = {
    CORSRules: [
      {
        AllowedOrigins: ["http://localhost:5173", "http://localhost:3000"],  // your dev frontend
        AllowedMethods: ["PUT", "POST", "GET", "HEAD"], // allow uploads and downloads
        AllowedHeaders: ["*"],
        ExposeHeaders: ["ETag", "x-amz-request-id"],
        MaxAgeSeconds: 3600,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfig,
    });
    const result = await s3.send(command);
    console.log("CORS updated successfully:", result);
  } catch (err) {
    console.error("Error updating CORS:", err);
  }
}

