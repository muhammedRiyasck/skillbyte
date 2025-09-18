export interface ValidationResponse {
  success: boolean;
  message: string;
}

export const validateCreateCourse = (data: any): Record<string, ValidationResponse> => {
  const errors: Record<string, ValidationResponse> = {};

  // Thumbnail
  if (!data.thumbnail) {
    errors.thumbnail = { success: false, message: "Thumbnail is required" };
  }

  // Course Title
  if (!data.title.trim()) {
    errors.course = { success: false, message: "Course title is required" };
  } else if (data.title.length < 5) {
    errors.course = { success: false, message: "Course title must be at least 5 characters" };
  }

  // Short Sentence
  if (!data.subText.trim()) {
    errors.shortSEntence = { success: false, message: "Short sentence is required" };
  } else if (data.subText.length > 120) {
    errors.shortSEntence = { success: false, message: "Short sentence cannot exceed 120 characters" };
  }

  // Category
  if (!data.category) {
    errors.category = { success: false, message: "Please select a category" };
  }

  // Custom Category (if Other is selected)
  if (data.category === "Other" && !data.customCategory.trim()) {
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
  } else if (isNaN(data.price)) {
    errors.price = { success: false, message: "Price must be a valid number" };
  }

  // Tags
  if (!data.tags.trim()) {
    errors.tags = { success: false, message: "Tags are required" };
  }

  //tags validation should be started with # and should not contain spaces
  if (data.tags) {
    const tagsArray = data.tags.split(" ");
    for (let tag of tagsArray) {
      if (!tag.startsWith("#")) {
        errors.tags = { success: false, message: "Each tag must start with #" };
        break;
      }
    }
}

 
  if ( data.features.length < 3) {
    errors.features = { success: false, message: "Please add at least 3 course features" };
  }else{
    for(let val of data.features){
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
