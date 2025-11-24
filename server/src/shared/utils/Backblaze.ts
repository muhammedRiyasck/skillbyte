import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/backblaze/S3Client";
import fs from "fs";
import { HttpError } from "../types/HttpError";
import { ERROR_MESSAGES } from "../constants/messages";
import { HttpStatusCode } from "../enums/HttpStatusCodes";

interface UploadOptions {
  folder: string;
  contentType?: string;
  publicRead?: boolean;
}

export const uploadToBackblaze = async (
  filePath: string,
  options: UploadOptions
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = `${options.folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${filePath.split('/').pop()}`;

    const uploadParams = {
      Bucket: process.env.B2_S3_BUCKET!,
      Key: fileName,
      Body: fileContent,
      ContentType: options.contentType || "application/octet-stream",
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Return the file key instead of signed URL for storage
    return fileName;
  } catch (err) {
    console.error("Backblaze upload error:", err);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);

  }
};

export const getBackblazeSignedUrl = async (fileName: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_S3_BUCKET!,
      Key: fileName,
    });

    // Generate signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (err) {
    console.error("Backblaze signed URL error:", err);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

export const deleteFromBackblaze = async (fileName: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.B2_S3_BUCKET!,
      Key: fileName,
    });

    await s3.send(command);
    console.log(`File ${fileName} deleted successfully from Backblaze`);
  } catch (err) {
    console.error("Backblaze delete error:", err);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};
