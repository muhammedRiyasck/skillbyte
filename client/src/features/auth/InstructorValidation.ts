
 export const isValidSubject = (subject: string,otherSubject:string) => {
  if (!subject) {
    
     return { success: false, message: "Please select your subject."};
  } else if (subject === "Other" && !otherSubject?.trim()) {
    
    return { success: false, message: "Please specify your subject" };
  }

  return {success:true,message:''}
}

  export const isValidJobTitle = (jobTitle: string,otherJobTitle:string) => {
  if (!jobTitle) {
    return { success: false, message: "Please select your job title."};
  } else if (jobTitle === "Other" && !otherJobTitle?.trim()) {
    return { success: false, message: "Please specify your job title" };
  }
    return {success:true,message:''}
}

  // ✅ Experience validation
export const isValidExperience = (number:string) => {
    const experience = Number(number)
  if (!experience && experience == 0) {
     return { success: false, message: "Experience is required at least 1 Year" };
  } else if (isNaN(experience)) {
    return { success: false, message:"Experience must be a valid number."};
  } else if (experience < 0) {
    return { success: false, message: "Experience cannot be negative."};
  }
    return {success:true,message:''}
}

  export const isValidSocailMedia = (linkedInUrl: string) => {
    if(!linkedInUrl.trim())return { success: false, message: "A professional social media profile is required to evaluate you!"};

  if (linkedInUrl && !/^https?:\/\/(www\.)?(linkedin\.com|twitter\.com|x\.com)\/.*$/.test(linkedInUrl)) {
    return { success: false, message: "Please enter a valid profile URL (linkedin,twitter,X)."};
  }
    return {success:true,message:''}
}

export const isValidPortfolio = (portfolioUrl: string) => {
  if (portfolioUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(portfolioUrl)) {
    return { success: false, message: "Please enter a valid portfolio URL."};
  }
  return { success: true, message: "" };
}

