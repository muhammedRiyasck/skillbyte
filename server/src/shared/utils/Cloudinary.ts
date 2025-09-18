import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder: string;
  resourceType?: "image" | "video";
  publicId?: string;
  overwrite?: boolean;
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
    });

    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw new Error("File upload failed");
  }
};
