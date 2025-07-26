import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../../utils/validation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<'details' | 'otp' | 'password'>('details');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const handleSendOtp = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!validateIndianPhoneNumber(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    // Simulate OTP sending
    setIsOtpSent(true);
    setStep('otp');
    toast.success('OTP sent to your phone number!');
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Simulate OTP verification (any 6 digits work for demo)
    setStep('password');
    toast.success('OTP verified successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    const success = await register(formData);
    
    if (success) {
      toast.success('Registration successful!');
      // Close the modal after successful registration
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } else {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join Tabuloo today</p>
      </div>

      {step === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

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

          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send OTP</span>
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
            />
            <p className="text-sm text-gray-500 mt-1">
              OTP sent to {formData.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Verify OTP
          </button>
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account</span>
          </button>
        </form>
      )}

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;