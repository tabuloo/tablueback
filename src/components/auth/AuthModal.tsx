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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-6 w-6" />
        </button>

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
  );
};

export default AuthModal;