import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

export const s3 = new S3Client({
  endpoint: `https://${process.env.B2_S3_ENDPOINT}`,
  region: 'us-east-005',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.B2_S3_KEY_ID!,
    secretAccessKey: process.env.B2_S3_SECRET!,
  },
  requestHandler: new NodeHttpHandler({
    /**
     * Poor-connection hardening:
     * - connectionTimeout: abort if TCP handshake takes > 10s (dead server / routing issue)
     * - socketTimeout: abort if no data received for 60s mid-transfer (stalled connection)
     * Without these, the SDK can silently hang indefinitely on a dead socket.
     */
    connectionTimeout: 10_000, // 10 seconds to establish TCP connection
    socketTimeout: 60_000, // 60 seconds of inactivity before aborting
  }),
});

export async function updateCors() {
  const keyId = process.env.B2_S3_KEY_ID!;
  const secret = process.env.B2_S3_SECRET!;
  const bucketName = process.env.B2_S3_BUCKET!;
  const frontendUrl = process.env.FRONTEND_URL!;
  const maxAge = Number(process.env.B2_S3_MAXAGESECONDS) || 3600;

  try {
    // Step 1: Authorise with B2 Native API
    const authHeader =
      'Basic ' + Buffer.from(`${keyId}:${secret}`).toString('base64');
    const authRes = await fetch(
      'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
      { headers: { Authorization: authHeader } },
    );
    if (!authRes.ok) {
      const body = await authRes.text();
      throw new Error(`b2_authorize_account failed ${authRes.status}: ${body}`);
    }

    const auth = (await authRes.json()) as {
      apiInfo: { storageApi: { apiUrl: string } };
      authorizationToken: string;
      accountId: string;
    };
    const { authorizationToken: token, accountId } = auth;
    const apiUrl = auth.apiInfo.storageApi.apiUrl;

    // Step 2: Get bucketId
    const listRes = await fetch(
      `${apiUrl}/b2api/v3/b2_list_buckets?accountId=${accountId}&bucketName=${encodeURIComponent(bucketName)}`,
      { headers: { Authorization: token } },
    );
    if (!listRes.ok) {
      const body = await listRes.text();
      throw new Error(`b2_list_buckets failed ${listRes.status}: ${body}`);
    }
    const { buckets } = (await listRes.json()) as {
      buckets: Array<{ bucketId: string }>;
    };
    const bucketId = buckets[0]?.bucketId;
    if (!bucketId) throw new Error(`Bucket "${bucketName}" not found in B2`);

    const clearRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, bucketId, corsRules: [] }),
    });
    if (!clearRes.ok) {
      const body = await clearRes.text();
      throw new Error(
        `b2_update_bucket (clear) failed ${clearRes.status}: ${body}`,
      );
    }

    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: [frontendUrl],
              AllowedMethods: ['GET', 'HEAD', 'PUT'],
              AllowedHeaders: ['*'],
              ExposeHeaders: ['ETag', 'Content-Length', 'x-amz-request-id'],
              MaxAgeSeconds: maxAge,
            },
          ],
        },
      }),
    );
  } catch (err) {
    console.error('ERROR updating B2 CORS:', err);
  }
}
