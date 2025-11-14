export default function isPhoneValid(phone: string): { success: boolean; message: string } {
  if (!phone || phone.trim() === '') {
    return { success: false, message: 'Phone number is required' };
  }
  // Remove all non-digit characters for validation
  const cleanedPhone = phone.replace(/\D/g, '');
  // Check if the cleaned phone number is between 10 and 15 digits (international format)
  if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
    return { success: false, message: 'Phone number must be between 10 and 15 digits' };
  }
  // Basic regex for phone number (allows international format with +)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(cleanedPhone) ? { success: true, message: '' } : { success: false, message: 'Invalid phone number format' };
}
