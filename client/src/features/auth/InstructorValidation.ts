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
export const isValidExperience = (number: string) => {
  if (!number || number.trim() === '') {
    return { success: false, message: "Experience is required" };
  }
  const experience = Number(number);
  if (isNaN(experience)) {
    return { success: false, message: "Experience must be a valid number." };
  }
  if (experience < 0) {
    return { success: false, message: "Experience cannot be negative." };
  }
  if (experience < 1) {
    return { success: false, message: "Experience must be at least 1 year." };
  }
  return { success: true, message: '' };
}

  export const isValidSocialMedia = (url: string) => {
    if(!url&&!url?.trim())return { success: false, message: "A professional social media profile is required to evaluate you!"};

  if (url && !/^https?:\/\/(www\.)?(linkedin\.com|twitter\.com|x\.com)\/.*$/.test(url)) {
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

export const isValidBio = (bio: string) => {
  if (!bio || !bio.trim()) {
    return { success: false, message: "Bio is required." };
  } else if (bio.trim().length < 50) {
    return { success: false, message: "Bio must be at least 50 characters long." };
  } else if (bio.trim().length > 500) {
    return { success: false, message: "Bio cannot exceed 500 characters." };
  }
  return { success: true, message: "" };
}

export const isValidResume = (resume: File | null) => {
  if (!resume) {
    return { success: false, message: "Resume is required." };
  }
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(resume.type)) {
    return { success: false, message: "Resume must be a PDF, DOC, or DOCX file." };
  }
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (resume.size > maxSize) {
    return { success: false, message: "Resume file size must not exceed 10MB." };
  }
  return { success: true, message: "" };
}
