export const formatOrderDate = (date: Date): string => {
  const today = new Date();
  const orderDate = new Date(date);
  
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
};

export const formatBookingDate = (date: Date): string => {
  const today = new Date();
  const bookingDate = new Date(date);
  
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
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
