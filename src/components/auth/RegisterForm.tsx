import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Send, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../../utils/validation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

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

  const handleSendOtp = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!validateIndianPhoneNumber(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate OTP (in real app, this would be sent via SMS)
      const generatedOtp = generateOTP();
      
      // Store OTP in localStorage for demo purposes
      // In production, this should be handled server-side
      localStorage.setItem(`otp_${formData.phone}`, generatedOtp);
      
      // Set timer for 60 seconds
      setOtpTimer(60);
      setIsOtpSent(true);
      setStep('otp');
      
      toast.success(`OTP sent to ${formData.phone}: ${generatedOtp}`);
      console.log(`OTP for ${formData.phone}: ${generatedOtp}`);
      
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Verify OTP
    const storedOtp = localStorage.getItem(`otp_${formData.phone}`);
    if (!storedOtp || storedOtp !== otp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }

    // Clear OTP from localStorage
    localStorage.removeItem(`otp_${formData.phone}`);
    
    // Proceed with registration
    const success = await register({
      ...formData,
      otp: otp // Pass OTP for verification
    });
    
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

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    await handleSendOtp();
  };

  return (
    <div className="bg-white p-8 rounded-2xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join Tabuloo today with OTP verification</p>
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
            disabled={isLoading || !formData.name.trim() || !formData.phone.trim() || !validateIndianPhoneNumber(formData.phone)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone className="h-4 w-4" />
            <span>{isLoading ? 'Sending...' : 'Send OTP'}</span>
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit OTP to <span className="font-semibold">{formData.phone}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {otpTimer > 0 ? (
                <span className="flex items-center text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Resend in {otpTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Resend OTP
                </button>
              )}
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('details');
                setIsOtpSent(false);
                setOtp('');
                setOtpTimer(0);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Change Number
            </button>
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            <span>Verify OTP & Register</span>
          </button>
        </div>
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