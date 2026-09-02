export interface UploadOptions {
  folder: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  overwrite?: boolean;
  contentType?: string;
}

export interface IStorageService {
  upload(filePath: string, options: UploadOptions): Promise<string>;
  delete(identifier: string): Promise<void>;
  deleteFolder(prefix: string): Promise<void>;
  getSignedUrl(identifier: string, expiresIn?: number): Promise<string>;
  fileExists(identifier: string): Promise<boolean>;
  generateUploadUrl(
    fileName: string,
    contentType?: string,
  ): Promise<{ signedUrl: string; publicUrl: string }>;
  getIdentifierFromUrl(url: string): string;
}
