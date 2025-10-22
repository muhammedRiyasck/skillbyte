import type { ValidationResponse } from "../types/ValidationResponse";

export const validateModule = (data: any): Record<string, ValidationResponse> => {
  const errors: Record<string, ValidationResponse> = {};

  if(!data.title.trim()){
    errors.title = { success: false, message: 'Title is required' };
  }else if (data.title.length < 3|| data.title.length > 100) {
    errors.title = { success: false, message: 'Title must be between 3 and 100 characters.' };
  }else if(!/^[a-zA-Z0-9\s.'"]+$/.test(data.title)){
    errors.title = { success: false, message: 'Only letters, numbers, and spaces allowed.' };
    
  }

  if(!data.description.trim()){
    errors.description = { success: false, message: 'Title is description' };
  }else if(data.description.length < 10 || data.description.length > 500) {
    errors.description = { success: false, message: 'Description must be between 10 and 500 characters.'};
  }
  // else if(!/^[a-zA-Z0-9\s]+$/.test(data.description)){
  //   errors.description = { success: false, message: 'Only letters, numbers, and spaces allowed.' };
  // }
  return errors

}

