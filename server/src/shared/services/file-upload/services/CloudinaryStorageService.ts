import { v2 as cloudinary } from 'cloudinary';
import { IStorageService, UploadOptions } from '../interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../constants/messages';
import { HttpError } from '../../../types/HttpError';
import { HttpStatusCode } from '../../../enums/HttpStatusCodes';
import logger from '../../../utils/Logger';

export class CloudinaryStorageService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(filePath: string, options: UploadOptions): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder,
        resource_type: options.resourceType || 'image',
        public_id: options.publicId,
        overwrite: options.overwrite ?? false,
      });
      return result.secure_url;
    } catch (err) {
      logger.error('Cloudinary upload error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error('Cloudinary delete error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSignedUrl(publicId: string): Promise<string> {
    // Cloudinary serves direct URLs for public assets,
    // now, returning the secure URL for a public asset.
    return cloudinary.url(publicId, { secure: true });
  }

  async generateUploadUrl(): Promise<{ signedUrl: string; publicUrl: string }> {
    throw new Error('Method not implemented for Cloudinary');
  }

  getIdentifierFromUrl(url: string): string {
    const match = url.match(/\/upload\/v\d+\/(.*?)(\.\w+)?$/);
    if (match) {
      return match[1];
    }
    throw new Error('Could not extract public ID from URL');
  }
}
