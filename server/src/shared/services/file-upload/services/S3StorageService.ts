import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../../../config/backblaze/S3Client';
import fs from 'fs/promises';
import path from 'path';
import { IStorageService, UploadOptions } from '../interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../constants/messages';
import { HttpError } from '../../../types/HttpError';
import { HttpStatusCode } from '../../../enums/HttpStatusCodes';
import logger from '../../../utils/Logger';

export class S3StorageService implements IStorageService {
  private bucket: string;
  private endpoint: string;

  constructor() {
    this.bucket = process.env.B2_S3_BUCKET!;
    this.endpoint = process.env.B2_S3_ENDPOINT!;
  }

  async upload(filePath: string, options: UploadOptions): Promise<string> {
    try {
      const fileContent = await fs.readFile(filePath);
      // Use path.basename to correctly handle both Unix and Windows paths
      const baseName = path.basename(filePath);
      const fileName = `${options.folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${baseName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: fileContent,
        ContentType: options.contentType || 'application/octet-stream',
      });

      await s3.send(command);
      return fileName;
    } catch (err: unknown) {
      const error = err as Error & {
        Code?: string;
        code?: string;
        $metadata?: { httpStatusCode?: number };
      };
      // Log the full error including Backblaze-specific details
      logger.error('S3 upload error:', {
        message: error?.message,
        code: error?.Code || error?.code,
        status: error?.$metadata?.httpStatusCode,
        filePath,
        folder: options.folder,
      });
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(key: string): Promise<void> {
    if (!key) return;
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await s3.send(command);
      logger.info(`S3 object deleted: ${key}`);
    } catch (err) {
      // Log the error but don't rethrow — deletion failures should not block DB operations
      logger.error('S3 delete error (non-blocking):', err);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(s3, command, { expiresIn });
    } catch (err) {
      logger.error('S3 getSignedUrl error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateUploadUrl(
    fileName: string,
    contentType: string = 'video',
  ): Promise<{ signedUrl: string; publicUrl: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      const publicUrl = `${this.endpoint}/${encodeURIComponent(fileName)}`;

      return { signedUrl, publicUrl };
    } catch (err) {
      logger.error('S3 generateUploadUrl error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getIdentifierFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return url; // fallback
    }
  }
}
