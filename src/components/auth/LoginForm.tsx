import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../../utils/validation';

interface LoginFormProps {
  role: 'admin' | 'restaurant_owner' | 'public_user';
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onSwitchToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (role === 'public_user') {
      if (!formData.phone.trim() || !formData.password.trim()) {
        toast.error('Phone number and password are required');
        return;
      }
      
      if (!validateIndianPhoneNumber(formData.phone)) {
        toast.error('Please enter a valid 10-digit Indian phone number');
        return;
      }
    } else {
      if (!formData.username.trim() || !formData.password.trim()) {
        toast.error('Username and password are required');
        return;
      }
    }
    
    const success = await login(formData, role);
    
    if (success) {
      toast.success('Login successful!');
      // Close the modal after successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'admin': return 'Admin Login';
      case 'restaurant_owner': return 'Restaurant Owner Login';
      case 'public_user': return 'User Login';
      default: return 'Login';
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{getRoleTitle()}</h2>
        <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'public_user' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
              {formData.phone && !validateIndianPhoneNumber(formData.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username/Email
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                //placeholder={role === 'admin' ? 'admin@tabuloo.com or 9985121257' : 'Enter username'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  //placeholder={role === 'admin' ? 'Admin@123' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
        
        {role === 'public_user' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </button>

        {role === 'public_user' && onSwitchToRegister && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;