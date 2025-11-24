import { v2 as cloudinary } from "cloudinary";
import { ERROR_MESSAGES } from "../constants/messages";
import { HttpError } from "../types/HttpError";
import { HttpStatusCode } from "../enums/HttpStatusCodes";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder: string;
  resourceType?: "image" | "raw"
  publicId?: string;
  overwrite?: boolean;
  accessMode?: "public" | "authenticated";
}

export const uploadToCloudinary = async (
  filePath: string,
  options: UploadOptions
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder,
      resource_type: options.resourceType || "image",
      public_id: options.publicId,
      overwrite: options.overwrite ?? false,
      access_mode: options.accessMode || "public",
    });

    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

export const getPublicIdFromUrl = (url: string): string => {
  const match = url.match(/\/upload\/v\d+\/(.*?)(\.\w+)?$/);
  if (match) {
    return match[1];
  }
  throw new Error('Could not extract public ID from URL');
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};
