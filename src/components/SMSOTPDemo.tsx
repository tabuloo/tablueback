import React, { useState } from 'react';
import PhoneVerification from './auth/PhoneVerification';
import { Phone, CheckCircle, XCircle } from 'lucide-react';

const SMSOTPDemo: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const handlePhoneSubmit = () => {
    if (phoneNumber.trim() && phoneNumber.length >= 10) {
      setShowVerification(true);
      setVerificationStatus('pending');
    }
  };

  const handleVerificationSuccess = (verifiedPhone: string) => {
    setVerificationStatus('success');
    console.log('Phone verified successfully:', verifiedPhone);
    // Here you would typically proceed with user registration/login
  };

  const handleVerificationFailure = () => {
    setVerificationStatus('failed');
    console.log('Phone verification failed');
    // Here you would handle the failure case
  };

  const resetDemo = () => {
    setPhoneNumber('');
    setShowVerification(false);
    setVerificationStatus('pending');
  };

  if (verificationStatus === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Phone Verification Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            Phone number <span className="font-medium">{phoneNumber}</span> has been verified.
          </p>
          <button
            onClick={resetDemo}
            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
          >
            Try Another Number
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Phone Verification Failed
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't verify your phone number. Please try again.
          </p>
          <button
            onClick={resetDemo}
            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!showVerification) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Phone className="h-12 w-12 text-red-800 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            SMS OTP Demo
          </h3>
          <p className="text-gray-600 text-sm">
            Enter your phone number to test the SMS OTP functionality
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          <button
            onClick={handlePhoneSubmit}
            disabled={!phoneNumber.trim() || phoneNumber.length < 10}
            className="w-full bg-red-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send OTP
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Enter your phone number</li>
            <li>Click "Send OTP" to receive a verification code</li>
            <li>Enter the 6-digit code you receive</li>
            <li>Verify your phone number</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <PhoneVerification
        phoneNumber={phoneNumber}
        purpose="registration"
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationFailure={handleVerificationFailure}
      />
    </div>
  );
};

export default SMSOTPDemo;


