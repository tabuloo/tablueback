import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Package, User, Phone, Mail, MapPin, Truck, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveryBoyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeliveryBoyFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  vehicleType: 'bike' | 'scooter' | 'car' | 'bicycle';
  vehicleNumber: string;
  vehicleModel: string;
  address: string;
  city: string;
  pincode: string;
  idProofType: 'aadhar' | 'pan' | 'driving_license' | 'voter_id';
  idProofNumber: string;
  emergencyContact: string;
  emergencyContactRelation: string;
}

const DeliveryBoyAuthModal: React.FC<DeliveryBoyAuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, sendAadhaarOTP, verifyAadhaarOTP, sendDeliveryLoginOTP } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Aadhaar verification states
  const [aadhaarOTPSent, setAadhaarOTPSent] = useState(false);
  const [aadhaarOTP, setAadhaarOTP] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  
  // Login OTP states
  const [loginOTPSent, setLoginOTPSent] = useState(false);
  const [loginOTP, setLoginOTP] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  const [formData, setFormData] = useState<DeliveryBoyFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    vehicleModel: '',
    address: '',
    city: '',
    pincode: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    emergencyContact: '',
    emergencyContactRelation: ''
  });

  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field: keyof DeliveryBoyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      toast.error('Emergency contact is required');
      return false;
    }
    if (formData.emergencyContact.length !== 10) {
      toast.error('Emergency contact must be exactly 10 digits');
      return false;
    }
    if (formData.phone === formData.emergencyContact) {
      toast.error('Emergency contact cannot be the same as your phone number');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.vehicleNumber.trim()) {
      toast.error('Vehicle number is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (formData.pincode.length !== 6) {
      toast.error('Pincode must be exactly 6 digits');
      return false;
    }
    if (!formData.idProofNumber.trim()) {
      toast.error('ID proof number is required');
      return false;
    }
    if (formData.idProofType === 'aadhar' && formData.idProofNumber.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return false;
    }
    if (!aadhaarVerified && formData.idProofType === 'aadhar') {
      toast.error('Please verify your Aadhaar number first');
      return false;
    }
    return true;
  };

  const validateLoginForm = () => {
    if (!loginData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (loginData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    if (loginMethod === 'password' && !loginData.password.trim()) {
      toast.error('Password is required');
      return false;
    }
    if (loginMethod === 'otp' && !loginOTP.trim()) {
      toast.error('OTP is required');
      return false;
    }
    return true;
  };

  const handleSendAadhaarOTP = async () => {
    if (!formData.idProofNumber.trim()) {
      toast.error('Please enter Aadhaar number first');
      return;
    }
    if (formData.idProofNumber.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await sendAadhaarOTP(formData.idProofNumber);
      if (success) {
        setAadhaarOTPSent(true);
      }
    } catch (error) {
      console.error('Error sending Aadhaar OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    if (!aadhaarOTP.trim()) {
      toast.error('Please enter OTP');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await verifyAadhaarOTP(formData.idProofNumber, aadhaarOTP);
      if (success) {
        setAadhaarVerified(true);
        setAadhaarOTPSent(false);
        setAadhaarOTP('');
      }
    } catch (error) {
      console.error('Error verifying Aadhaar OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendLoginOTP = async () => {
    if (!loginData.phone.trim()) {
      toast.error('Please enter phone number first');
      return;
    }
    if (loginData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await sendDeliveryLoginOTP(loginData.phone);
      if (success) {
        setLoginOTPSent(true);
      }
    } catch (error) {
      console.error('Error sending login OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'delivery_boy',
        vehicleDetails: {
          type: formData.vehicleType,
          number: formData.vehicleNumber,
          model: formData.vehicleModel
        },
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        idProof: {
          type: formData.idProofType,
          number: formData.idProofNumber
        },
        emergencyContact: {
          phone: formData.emergencyContact,
          relation: formData.emergencyContactRelation
        },
        isOnline: false,
        earnings: {
          total: 0,
          thisMonth: 0,
          thisWeek: 0
        }
      };

      const success = await register(userData);
      if (success) {
        toast.success('Registration successful! You can now login.');
        setIsLogin(true);
        setFormData({
          name: '', email: '', phone: '', password: '', confirmPassword: '',
          vehicleType: 'bike', vehicleNumber: '', vehicleModel: '',
          address: '', city: '', pincode: '',
          idProofType: 'aadhar', idProofNumber: '',
          emergencyContact: '', emergencyContactRelation: ''
        });
        setAadhaarVerified(false);
        setAadhaarOTPSent(false);
        setAadhaarOTP('');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsSubmitting(true);
    try {
      let credentials;
      if (loginMethod === 'password') {
        credentials = { phone: loginData.phone, password: loginData.password };
      } else {
        credentials = { phone: loginData.phone, otp: loginOTP };
      }
      
      const success = await login(credentials, 'delivery_boy');
      if (success) {
        toast.success('Login successful!');
        onClose();
        // Reset form
        setLoginData({ phone: '', password: '' });
        setLoginOTP('');
        setLoginOTPSent(false);
        setLoginMethod('password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Delivery Partner Login' : 'Delivery Partner Registration'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Toggle Buttons */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={loginData.phone}
                  onChange={(e) => handleLoginInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  maxLength={10}
                />
              </div>

              {/* Login Method Toggle */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'password'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'otp'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OTP
                </button>
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginData.password}
                      onChange={(e) => handleLoginInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={loginOTP}
                      onChange={(e) => setLoginOTP(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleSendLoginOTP}
                      disabled={isSubmitting || loginOTPSent}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loginOTPSent ? 'OTP Sent' : 'Send OTP'}
                    </button>
                  </div>
                  {loginOTPSent && (
                    <p className="text-xs text-green-600 mt-1">
                      OTP sent to your registered mobile number
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Emergency contact number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Relation
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Father, Mother, Spouse"
                />
              </div>

              {/* Vehicle Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-red-600" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      required
                      value={formData.vehicleType}
                      onChange={(e) => handleInputChange('vehicleType', e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="car">Car</option>
                      <option value="bicycle">Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleNumber}
                      onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., KA01AB1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., Honda Activa 6G"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Proof */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof Type *
                    </label>
                    <select
                      required
                      value={formData.idProofType}
                      onChange={(e) => handleInputChange('idProofType', e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="aadhar">Aadhar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.idProofNumber}
                      onChange={(e) => handleInputChange('idProofNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={formData.idProofType === 'aadhar' ? 'Enter 12-digit Aadhaar number' : 'Enter ID proof number'}
                      maxLength={formData.idProofType === 'aadhar' ? 12 : undefined}
                    />
                  </div>
                </div>

                {/* Aadhaar Verification Section */}
                {formData.idProofType === 'aadhar' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-900">Aadhaar Verification Required</h4>
                    </div>
                    
                    {!aadhaarVerified ? (
                      <div className="space-y-3">
                        <p className="text-xs text-blue-700">
                          For security, we need to verify your Aadhaar number. An OTP will be sent to your Aadhaar registered mobile number.
                        </p>
                        
                        {!aadhaarOTPSent ? (
                          <button
                            type="button"
                            onClick={handleSendAadhaarOTP}
                            disabled={isSubmitting || formData.idProofNumber.length !== 12}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Send Aadhaar Verification OTP
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={aadhaarOTP}
                                onChange={(e) => setAadhaarOTP(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyAadhaarOTP}
                                disabled={isSubmitting || !aadhaarOTP.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                              >
                                Verify OTP
                              </button>
                            </div>
                            <p className="text-xs text-blue-600">
                              OTP sent to your Aadhaar registered mobile number
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Aadhaar verified successfully!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Why become a delivery partner?</p>
                <ul className="mt-2 space-y-1">
                  <li>• Flexible working hours</li>
                  <li>• Earn ₹20-50 per delivery</li>
                  <li>• Weekly payments</li>
                  <li>• Performance bonuses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyAuthModal;
