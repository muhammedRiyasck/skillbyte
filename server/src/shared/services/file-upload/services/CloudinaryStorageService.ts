import { v2 as cloudinary } from 'cloudinary';
import { IStorageService, UploadOptions } from '../interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../constants/messages';
import { HttpError } from '../../../types/HttpError';
import { HttpStatusCode } from '../../../enums/HttpStatusCodes';
import logger from '../../../utils/Logger';

export type MessageFileType = 'image' | 'video' | 'document';

export interface UploadBufferResult {
  url: string;
  type: MessageFileType;
  fileName: string;
  mimeType: string;
}

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

  /**
   * Satisfies the IStorageService interface.
   * Resumes are stored in S3 (Backblaze), not Cloudinary — this method is not used.
   */
  async uploadBuffer(
    _buffer: Buffer,
    _originalName: string,
    _options: UploadOptions,
  ): Promise<string> {
    throw new HttpError(
      'uploadBuffer is not implemented for Cloudinary. Use S3StorageService for resume uploads.',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Uploads an in-memory buffer (e.g. from multer memoryStorage) to Cloudinary.
   * Used by the chat module. Determines folder, resource_type, and message type
   * from the file's MIME type.
   */
  async uploadChatBuffer(file: Express.Multer.File): Promise<UploadBufferResult> {
    const { resourceType, folder, messageType } = this.resolveUploadConfig(
      file.mimetype,
    );
    const isRaw = resourceType === 'raw';

    try {
      const secure_url = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            ...(isRaw && {
              public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`,
            }),
          },
          (error, result) => {
            if (error || !result)
              reject(error ?? new Error('Cloudinary upload failed'));
            else resolve(result.secure_url);
          },
        );
        stream.end(file.buffer);
      });

      return {
        url: secure_url,
        type: messageType,
        fileName: file.originalname,
        mimeType: file.mimetype,
      };
    } catch (err) {
      logger.error('Cloudinary buffer upload error:', err);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private resolveUploadConfig(mimetype: string): {
    resourceType: 'image' | 'video' | 'raw';
    folder: string;
    messageType: MessageFileType;
  } {
    if (mimetype.startsWith('image/'))
      return {
        resourceType: 'image',
        folder: 'chat/images',
        messageType: 'image',
      };
    if (mimetype.startsWith('video/'))
      return {
        resourceType: 'video',
        folder: 'chat/videos',
        messageType: 'video',
      };
    return {
      resourceType: 'raw',
      folder: 'chat/documents',
      messageType: 'document',
    };
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

  async deleteFolder(prefix: string): Promise<void> {
    // Cloudinary isn't currently used for HLS video storage, so we can just log this.
    // If needed in the future, we would use cloudinary.api.delete_resources_by_prefix
    // followed by cloudinary.api.delete_folder.
    logger.info(
      `deleteFolder called for Cloudinary with prefix ${prefix}, skipping.`,
    );
  }

  async getSignedUrl(publicId: string): Promise<string> {
    // Cloudinary serves direct URLs for public assets,
    // now, returning the secure URL for a public asset.
    return cloudinary.url(publicId, { secure: true });
  }

  async generateUploadUrl(): Promise<{ signedUrl: string; publicUrl: string }> {
    throw new HttpError(
      'Method not implemented for Cloudinary',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  async fileExists(_key: string): Promise<boolean> {
    // Cloudinary is used for images/profiles, not for HLS video storage.
    // This method is only needed by S3StorageService for the transcode pipeline.
    throw new HttpError(
      'fileExists is not implemented for Cloudinary',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  getIdentifierFromUrl(url: string): string {
    const match = url.match(/\/upload\/v\d+\/(.*?)(\.\w+)?$/);
    if (match) {
      return match[1];
    }
    throw new HttpError(
      'Could not extract public ID from URL',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }
}
