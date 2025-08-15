import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../../utils/validation';

interface LoginFormProps {
  role: 'admin' | 'restaurant_owner' | 'public_user';
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onSwitchToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    otp: '',
    password: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // OTP timer countdown
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number first');
      return;
    }

    if (!validateIndianPhoneNumber(formData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate OTP (in real app, this would be sent via SMS)
      const otp = generateOTP();
      
      // Store OTP in localStorage for demo purposes
      // In production, this should be handled server-side
      localStorage.setItem(`otp_${formData.phone}`, otp);
      
      // Set timer for 60 seconds
      setOtpTimer(60);
      setOtpSent(true);
      
      toast.success(`OTP sent to ${formData.phone}: ${otp}`);
      console.log(`OTP for ${formData.phone}: ${otp}`);
      
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'public_user') {
      if (!formData.phone.trim() || !formData.otp.trim()) {
        toast.error('Phone number and OTP are required');
        return;
      }
      
      if (!validateIndianPhoneNumber(formData.phone)) {
        toast.error('Please enter a valid 10-digit Indian phone number');
        return;
      }

      if (formData.otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }

      // Verify OTP
      const storedOtp = localStorage.getItem(`otp_${formData.phone}`);
      if (!storedOtp || storedOtp !== formData.otp) {
        toast.error('Invalid OTP. Please try again.');
        return;
      }

      // Clear OTP from localStorage
      localStorage.removeItem(`otp_${formData.phone}`);
      
    } else if (role === 'restaurant_owner') {
      if (!formData.username.trim() || !formData.password.trim()) {
        toast.error('Username and password are required');
        return;
      }
    } else if (role === 'admin') {
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
        <p className="text-gray-600 mt-2">
          {role === 'restaurant_owner' 
            ? 'Enter your username and password to continue'
            : 'Enter your phone number and OTP to continue'
          }
        </p>
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
                disabled={otpSent}
              />
              {formData.phone && !validateIndianPhoneNumber(formData.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
              )}
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                disabled={isLoading || !formData.phone.trim() || !validateIndianPhoneNumber(formData.phone)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="h-4 w-4" />
                <span>{isLoading ? 'Sending...' : 'Send OTP'}</span>
              </button>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {otpTimer > 0 ? (
                      <span className="flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={sendOTP}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: '' }));
                      setOtpTimer(0);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}
          </>
        ) : role === 'restaurant_owner' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Username/Email/Phone
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin credentials"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use: 9985121257 or tablooofficial1@gmail.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Demo password: admin123
              </p>
            </div>
          </>
        )}

        {(otpSent || role === 'restaurant_owner' || role === 'admin') && (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        )}

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