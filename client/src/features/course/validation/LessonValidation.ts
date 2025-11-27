import type { ValidationResponse } from "../types/ValidationResponse";

interface LessonData {
  title: string;
  description: string;
  file: File;
  resources: string[];
}

export const validateLesson = (data: LessonData): Record<string, ValidationResponse> => {
  const errors: Record<string, ValidationResponse> = {};
  
  if (!data.title.trim()) {
    errors.title = { success: false, message: "Title is required" };
  } else if (data.title.length < 3 || data.title.length > 100) {
    errors.title = { success: false, message: "Title must be between 3 and 100 characters." };
  } else if (!/^[a-zA-Z0-9\s.'"]+$/.test(data.title)) {
    errors.title = { success: false, message: "Only letters, numbers, and spaces allowed." };
  }
  if (!data.description.trim()) {
    errors.description = { success: false, message: "Title is description" };
  } else if (data.description.length < 10 || data.description.length > 500) {
    errors.description = { success: false, message: "Description must be between 10 and 500 characters." };
  }

  const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
  const maxSizeInMB = 900; // Maximum 200 MB
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!data.file){
    errors.video = { success: false, message: "Lesson video is required" };
  } else if(!allowedTypes.includes(data.file.type)) {
    errors.video = { success: false, message: "Invalid file type. Only MP4, WebM, and OGG videos are allowed." };
  } else if (data.file.size > maxSizeInBytes) {
    errors.video = { success: false, message: `File is too large. Maximum allowed size is ${maxSizeInMB} MB.` };
  }


if (data?.resources.length > 0 && data?.resources[0].trim() !== "") {
  for (const val of data.resources) {
    // 1. Empty check
    if (!val.trim()) {
      errors.resources = {
        success: false,
        message: "All resources field should be filled",
      };
      break;
    }

    // 2. Validate full http/https link
    try {
      const url = new URL(val); // safe inside try
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.resources = {
          success: false,
          message: "Only http or https links are allowed",
        };
        break;
      }
    } catch {
      errors.resources = {
        success: false,
        message: "Invalid URL format. Must start with http:// or https://",
      };
      break;
    }
  }
}

  return errors;
};
