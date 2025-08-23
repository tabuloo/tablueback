import React, { useState, useEffect } from 'react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide offline message after 5 seconds
  useEffect(() => {
    if (showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showOfflineMessage]);

  if (!isOnline && showOfflineMessage) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 text-center shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="font-medium">
            You are currently offline. Please check your internet connection.
          </span>
          <button
            onClick={() => setShowOfflineMessage(false)}
            className="ml-2 text-white hover:text-red-200 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Show a subtle online indicator when coming back online
  if (isOnline && showOfflineMessage === false) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 text-center shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">
            Connection restored
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;

