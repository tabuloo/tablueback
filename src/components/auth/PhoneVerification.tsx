import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: (phoneNumber: string) => void;
  onVerificationFailure: () => void;
  purpose: 'registration' | 'login' | 'password_reset';
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onVerificationFailure,
  purpose
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const response = await apiService.sendOTP({
        phoneNumber: phoneNumber.trim(),
        purpose
      });

      if (response.success) {
        setOtpSent(true);
        setStep('verify');
        setCountdown(60); // 60 seconds countdown
        toast.success(response.message || 'OTP sent successfully!');
        
        // In development, show the OTP if available
        if (response.data?.otp) {
          toast.success(`Development OTP: ${response.data.otp}`, { duration: 10000 });
        }
      } else {
        setError(response.message || 'Failed to send OTP');
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const response = await apiService.verifyOTP({
        phoneNumber: phoneNumber.trim(),
        otp: otp.trim()
      });

      if (response.success) {
        toast.success(response.message || 'Phone number verified successfully!');
        onVerificationSuccess(phoneNumber.trim());
      } else {
        setError(response.message || 'Invalid OTP');
        toast.error(response.message || 'Invalid OTP');
        onVerificationFailure();
      }
    } catch (error) {
      const errorMessage = 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      onVerificationFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      const response = await apiService.resendOTP({
        phoneNumber: phoneNumber.trim(),
        purpose
      });

      if (response.success) {
        setCountdown(60);
        toast.success(response.message || 'OTP resent successfully!');
        
        // In development, show the OTP if available
        if (response.data?.otp) {
          toast.success(`Development OTP: ${response.data.otp}`, { duration: 10000 });
        }
      } else {
        setError(response.message || 'Failed to resend OTP');
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'send') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Phone className="h-12 w-12 text-red-800 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Your Phone Number
          </h3>
          <p className="text-gray-600 text-sm">
            We'll send a verification code to <span className="font-medium">{phoneNumber}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleSendOTP}
          disabled={isLoading}
          className="w-full bg-red-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Verification Code
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Phone className="h-12 w-12 text-red-800 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enter Verification Code
        </h3>
        <p className="text-gray-600 text-sm">
          We've sent a 6-digit code to <span className="font-medium">{phoneNumber}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
            if (error) setError(null);
          }}
          placeholder="Enter 6-digit code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          maxLength={6}
        />
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={isLoading || otp.length !== 6}
        className="w-full bg-red-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </button>

      <div className="text-center space-y-2">
        {countdown > 0 ? (
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Resend available in {formatTime(countdown)}
          </div>
        ) : (
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-red-800 hover:text-red-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-1" />
                Resend Code
              </>
            )}
          </button>
        )}
      </div>

      <button
        onClick={() => {
          setStep('send');
          setError(null);
          setOtp('');
        }}
        className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
      >
        ← Change Phone Number
      </button>
    </div>
  );
};

export default PhoneVerification;
