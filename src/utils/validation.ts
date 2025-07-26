// Validation utility functions
export const validateIndianPhoneNumber = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits and starts with 6, 7, 8, or 9
  return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters and limit to 10 digits
  return phone.replace(/\D/g, '').slice(0, 10);
};

export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove any non-digit characters
  const cleanCard = cardNumber.replace(/\D/g, '');
  
  // Check if it's exactly 16 digits
  return cleanCard.length === 16;
};

export const formatCardNumber = (cardNumber: string): string => {
  // Remove any non-digit characters and limit to 16 digits
  const clean = cardNumber.replace(/\D/g, '').slice(0, 16);
  
  // Add spaces every 4 digits for display
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

export const validateCVV = (cvv: string): boolean => {
  // Remove any non-digit characters
  const cleanCVV = cvv.replace(/\D/g, '');
  
  // Check if it's exactly 3 digits
  return cleanCVV.length === 3;
};

export const formatCVV = (cvv: string): string => {
  // Remove any non-digit characters and limit to 3 digits
  return cvv.replace(/\D/g, '').slice(0, 3);
};

export const validateExpiryDate = (expiry: string): boolean => {
  // Check format MM/YY
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  
  if (!expiryRegex.test(expiry)) {
    return false;
  }
  
  // Check if the date is not in the past
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);
  
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return false;
  }
  
  return true;
};

export const formatExpiryDate = (expiry: string): string => {
  // Remove any non-digit characters
  const clean = expiry.replace(/\D/g, '');
  
  // Format as MM/YY
  if (clean.length >= 2) {
    const month = clean.slice(0, 2);
    const year = clean.slice(2, 4);
    return year ? `${month}/${year}` : month;
  }
  
  return clean;
};