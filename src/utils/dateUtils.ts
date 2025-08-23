export const formatOrderDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const orderDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(orderDate.getTime())) {
      return 'Invalid Date';
    }
    
    const today = new Date();
    
    // Check if it's the same day
    if (orderDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (orderDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Return formatted date for other days
    return orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting order date:', error);
    return 'Invalid Date';
  }
};

export const formatBookingDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const bookingDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(bookingDate.getTime())) {
      return 'Invalid Date';
    }
    
    const today = new Date();
    
    // Check if it's the same day
    if (bookingDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (bookingDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Return formatted date for other days
    return bookingDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting booking date:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};
