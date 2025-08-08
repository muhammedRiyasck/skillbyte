

  export default function isEmailValid  (email: string): {success: boolean,message: string}  {
    if (!email || email.trim() === '') {
        return {success:false, message: 'Email is required'};
    }
  const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) ? {success: true , message:''} : {success: false, message: 'ⓧ Invalid email format'};
}

