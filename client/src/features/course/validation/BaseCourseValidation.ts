import type { ValidationResponse } from "../types/ValidationResponse";

interface CreateCourseData {
  thumbnailFile: File|null;
  title: string;
  subText: string;
  category: string;
  customCategory?: string;
  courseLevel: string;
  language: string;
  access: string;
  price: string;
  tags: string[];
  features: string[];
  description: string;
}

export const validateCreateCourse = (data: CreateCourseData): Record<string, ValidationResponse> => {
  const errors: Record<string, ValidationResponse> = {};

  // Thumbnail
  if (!data.thumbnailFile) {
    errors.thumbnailFile = { success: false, message: "Thumbnail is required" };
  } else if (data.thumbnailFile.size > 2 * 1024 * 1024) {
    errors.thumbnailFile = { success: false, message: "Thumbnail must be less than 2 MB"};
  }

  // Course Title
  if (!data.title.trim()) {
    errors.title = { success: false, message: "Course title is required" };
  } else if (data.title.length < 5) {
    errors.title = { success: false, message: "Course title must be at least 5 characters" };
  }

  // Short Sentence
  if (!data.subText.trim()) {
    errors.subText = { success: false, message: "Short sentence is required" };
  } else if (data.subText.length > 120) {
    errors.subText = { success: false, message: "Short sentence cannot exceed 120 characters" };
  }

  // Category
  if (!data.category) {
    errors.category = { success: false, message: "Please select a category" };
  }

  // Custom Category (if Other is selected)
  if (data.category === "Other" && (!data.customCategory || !data.customCategory.trim())) {
    errors.customCategory = { success: false, message: "Custom category is required" };
  }

  // Course Level
  if (!data.courseLevel) {
    errors.courseLevel = { success: false, message: "Please select a course level" };
  }

  // Language
  if (!data.language) {
    errors.language = { success: false, message: "Please select a language" };
  }

  // Access
  if (!data.access) {
    errors.access = { success: false, message: "Please select access duration" };
  }

  // Price
  if (!data.price.trim()) {
    errors.price = { success: false, message: "Course price is required" };
  } else if (isNaN(Number(data.price))) {
    errors.price = { success: false, message: "Price must be a valid number" };
  }

  // Tags
  if (!data.tags || data.tags.length === 0 || !data.tags[0].trim()) {
    errors.tags = { success: false, message: "At least one tag is required" };
  } else {
    for (const tag of data.tags) {
 
      if (tag.includes(" ")) {
        errors.tags = { success: false, message: "Tags should not contain spaces" };
        break;
      }
    }
  }

  if ( data.features.length < 3) {
    errors.features = { success: false, message: "Please add at least 3 course features" };
  }else{
    for(const val of data.features){
      if(!val.trim()) errors.features = { success: false, message: "All course features should be filled" };
    }
  }

  // Description
  if (!data.description.trim()) {
    errors.description = { success: false, message: "Course description is required" };
  } else if (data.description.length < 20) {
    errors.description = { success: false, message: "Description must be at least 20 characters long" };
  }

  return errors;
};
