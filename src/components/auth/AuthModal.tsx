import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authType: 'admin' | 'restaurant_owner' | 'public_user';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, authType }) => {
  const [showRegister, setShowRegister] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 z-10 p-2"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="p-4 sm:p-8">
          {showRegister && authType === 'public_user' ? (
            <RegisterForm 
              onSwitchToLogin={() => setShowRegister(false)} 
              onRegisterSuccess={onClose}
            />
          ) : (
            <LoginForm 
              role={authType} 
              onSwitchToRegister={authType === 'public_user' ? () => setShowRegister(true) : undefined}
              onLoginSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;