import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, updateCors } from '../../../config/backblaze/S3Client';
import fs from 'fs/promises';
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
      const fileName = `${options.folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${filePath.split('/').pop()}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: fileContent,
        ContentType: options.contentType || 'application/octet-stream',
      });

      await s3.send(command);
      return fileName;
    } catch (err) {
      logger.error('S3 upload error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await s3.send(command);
    } catch (err) {
      logger.error('S3 delete error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
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

      await updateCors();

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
    // For S3/Backblaze, the identifier is the key, which is usually the last part of the URL
    // or we can just return the URL itself if we store the key separately.
    // In your implementation, you return the fileName/key.
    // If you have a full URL like https://endpoint/bucket/key, we extract key.
    try {
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);
      // Pathname usually starts with /bucket/key or just /key depending on endpoint usage
      // Here we assume it's just the key for now based on how publicUrl is constructed.
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return url; // fallback
    }
  }
}
