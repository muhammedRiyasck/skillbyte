import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  endpoint: `https://${process.env.B2_S3_ENDPOINT}`,
  region: 'us-east-005',
  credentials: {
    accessKeyId: process.env.B2_S3_KEY_ID!,
    secretAccessKey: process.env.B2_S3_SECRET!,
  },
});

export async function updateCors() {
  const bucketName = process.env.B2_S3_BUCKET_NAME!;

  const corsConfig = {
    CORSRules: [
      {
        AllowedOrigins: [process.env.FRONTEND_URL!],
        AllowedMethods: ['PUT', 'POST', 'GET', 'HEAD'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag', 'x-amz-request-id'],
        MaxAgeSeconds: 3600,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfig,
    });
    await s3.send(command);
    // console.log('CORS updated successfully:', result);
  } catch (err) {
    console.error('Error updating CORS:', err);
  }
}
