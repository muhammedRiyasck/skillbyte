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

/** Handles cloudinary storage service functionality. */
export class CloudinaryStorageService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload for the CloudinaryStorageService entity.
   *
   * @param filePath - The file path information.
   * @param options - The options information.
   * @returns The result of the operation.
   */
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
   * Upload buffer for the CloudinaryStorageService entity.
   *
   * @param _buffer - The _buffer information.
   * @param _originalName - The _original name information.
   * @param _options - The _options information.
   * @returns The result of the operation.
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
   * Upload chat buffer for the CloudinaryStorageService entity.
   *
   * @param file - The file information.
   * @returns The result of the operation.
   */
  async uploadChatBuffer(
    file: Express.Multer.File,
  ): Promise<UploadBufferResult> {
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

  /**
   * Delete for the CloudinaryStorageService entity.
   *
   * @param publicId - The unique identifier for the public.
   */
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

  /**
   * Delete folder for the CloudinaryStorageService entity.
   *
   * @param prefix - The prefix information.
   */
  async deleteFolder(prefix: string): Promise<void> {
    // Cloudinary isn't currently used for HLS video storage, so we can just log this.
    // If needed in the future, we would use cloudinary.api.delete_resources_by_prefix
    // followed by cloudinary.api.delete_folder.
    logger.info(
      `deleteFolder called for Cloudinary with prefix ${prefix}, skipping.`,
    );
  }

  /**
   * Get signed url for the CloudinaryStorageService entity.
   *
   * @param publicId - The unique identifier for the public.
   * @returns The result of the operation.
   */
  async getSignedUrl(publicId: string): Promise<string> {
    // Cloudinary serves direct URLs for public assets,
    // now, returning the secure URL for a public asset.
    return cloudinary.url(publicId, { secure: true });
  }

  /**
   * Generate upload url for the CloudinaryStorageService entity.
   *
   * @returns The result of the operation.
   */
  async generateUploadUrl(): Promise<{ signedUrl: string; publicUrl: string }> {
    throw new HttpError(
      'Method not implemented for Cloudinary',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * File exists for the CloudinaryStorageService entity.
   *
   * @param _key - The _key information.
   * @returns The result of the operation.
   */
  async fileExists(_key: string): Promise<boolean> {
    // Cloudinary is used for images/profiles, not for HLS video storage.
    // This method is only needed by S3StorageService for the transcode pipeline.
    throw new HttpError(
      'fileExists is not implemented for Cloudinary',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Get identifier from url for the CloudinaryStorageService entity.
   *
   * @param url - The url information.
   * @returns The result of the operation.
   */
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
