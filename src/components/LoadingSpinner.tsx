import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-red-800 flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-white shadow-xl ring-2 ring-white/60 flex items-center justify-center animate-pulse-slow">
        <img
          src="/tabuloo-logo.png"
          alt="Tabuloo"
          className="h-16 w-16 object-contain rounded-full"
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;