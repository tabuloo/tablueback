import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock, Users, CreditCard, Plus, Trash2, Wallet, Building, Smartphone, Banknote, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber, validateCardNumber, formatCardNumber, validateCVV, formatCVV, validateExpiryDate, formatExpiryDate } from '../../utils/validation';

interface BookTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurantId?: string;
}

const BookTableModal: React.FC<BookTableModalProps> = ({ isOpen, onClose, selectedRestaurantId }) => {
  const { user, updateWalletBalance } = useAuth();
  const { restaurants, addBooking } = useApp();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'netbanking' | 'card' | 'upi' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [formData, setFormData] = useState({
    restaurantId: selectedRestaurantId || '',
    date: '',
    time: '',
    customers: '1',
    customerNames: [''],
    phone: user?.phone || '',
    specialRequests: '',
    foodOptions: ''
  });

  const paymentMethods = [
    { id: 'wallet', name: 'Tabuloo Wallet', icon: Wallet, description: `Balance: ₹${(user?.walletBalance || 0).toFixed(2)}` },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks supported' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when you arrive' }
  ];

  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurantId);

  const handleCustomerCountChange = (count: string) => {
    const numCount = parseInt(count) || 1;
    const names = Array(numCount).fill('').map((_, index) => formData.customerNames[index] || '');
    setFormData(prev => ({ ...prev, customers: count, customerNames: names }));
  };

  const handleNameChange = (index: number, name: string) => {
    const updatedNames = [...formData.customerNames];
    updatedNames[index] = name;
    setFormData(prev => ({ ...prev, customerNames: updatedNames }));
  };

  const addCustomerField = () => {
    setFormData(prev => ({
      ...prev,
      customerNames: [...prev.customerNames, '']
    }));
  };

  const removeCustomerField = (index: number) => {
    if (formData.customerNames.length > 1) {
      const updatedNames = formData.customerNames.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        customerNames: updatedNames,
        customers: updatedNames.length.toString()
      }));
    }
  };

  const validateForm = () => {
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant');
      return false;
    }

    if (!formData.date || !formData.time) {
      toast.error('Please select date and time');
      return false;
    }

    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }
    
    if (!validateIndianPhoneNumber(formData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    const customerCount = parseInt(formData.customers);
    if (customerCount > 2) {
      // Only first customer name is required for groups > 2
      if (!formData.customerNames[0]?.trim()) {
        toast.error('At least one customer name is required');
        return false;
      }
    } else {
      // All names required for groups <= 2
      const filledNames = formData.customerNames.filter(name => name.trim() !== '');
      if (filledNames.length !== customerCount) {
        toast.error('Please provide names for all customers');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedRestaurant || !user) return;

    // Validate card details if card payment is selected
    if (paymentMethod === 'card') {
      if (!validateCardNumber(cardDetails.number)) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!validateCVV(cardDetails.cvv)) {
        toast.error('Please enter a valid 3-digit CVV');
        return;
      }
      if (!validateExpiryDate(cardDetails.expiry)) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardDetails.name.trim()) {
        toast.error('Please enter cardholder name');
        return;
      }
    }

    const totalAmount = selectedRestaurant.price * parseInt(formData.customers);
    const advanceAmount = totalAmount * 0.2; // 20% advance

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < advanceAmount) {
        toast.error('Insufficient wallet balance');
        return;
      }
      updateWalletBalance((user.walletBalance || 0) - advanceAmount);
    }

    const booking = {
      userId: user.id,
      restaurantId: formData.restaurantId,
      type: 'table' as const,
      date: formData.date,
      time: formData.time,
      customers: parseInt(formData.customers),
      customerNames: formData.customerNames.filter(name => name.trim() !== ''),
      phone: formData.phone,
      status: 'confirmed' as const,
      paymentStatus: 'paid' as const,
      amount: advanceAmount,
      createdAt: new Date(),
      specialRequests: formData.specialRequests,
      foodOptions: formData.foodOptions,
      paymentMethod: paymentMethod
    };

    try {
      await addBooking(booking);
      
      // Simulate email sending
      await sendBookingEmails(booking, selectedRestaurant, user);
      
      setStep('confirmation');
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const sendBookingEmails = async (booking: any, restaurant: any, user: any) => {
    // Simulate email sending to user and restaurant
    console.log('Sending booking confirmation emails:', {
      userEmail: user.email || user.phone,
      restaurantEmail: restaurant.ownerCredentials.username,
      bookingDetails: booking
    });
    
    // In a real app, this would integrate with an email service
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Book Table</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name of the Restaurant *
              </label>
              <select
                value={formData.restaurantId}
                onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a restaurant</option>
                {restaurants.filter(r => r.isOpen).map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - ₹{restaurant.price}/person
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Number of Customers *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.customers}
                onChange={(e) => handleCustomerCountChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name of the Customers
                  {parseInt(formData.customers) > 2 && (
                    <span className="text-sm text-gray-500 ml-1">
                      (First name required, others optional)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={addCustomerField}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Customer</span>
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.customerNames.map((name, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`Customer ${index + 1} name${index === 0 && parseInt(formData.customers) > 2 ? ' (required)' : ''}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={parseInt(formData.customers) <= 2 || index === 0}
                    />
                    {formData.customerNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCustomerField(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
              {formData.phone && !validateIndianPhoneNumber(formData.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Options & Preferences
              </label>
              <textarea
                value={formData.foodOptions}
                onChange={(e) => setFormData(prev => ({ ...prev, foodOptions: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any specific food preferences, dietary restrictions, or menu requests..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any special arrangements, celebrations, or additional requests..."
              />
            </div>

            {selectedRestaurant && parseInt(formData.customers) > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Restaurant: {selectedRestaurant.name}</p>
                  <p>Date: {formData.date} at {formData.time}</p>
                  <p>Customers: {formData.customers}</p>
                  <p>Total Amount: ₹{(selectedRestaurant.price * parseInt(formData.customers)).toFixed(2)}</p>
                  <p className="font-medium text-blue-600">
                    Advance Payment (20%): ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <span>Book Table</span>
            </button>
          </form>
        )}

        {step === 'payment' && selectedRestaurant && (
          <div className="p-6">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Details</h3>
              <p className="text-gray-600">
                Advance payment of ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)} required
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isWalletInsufficient = method.id === 'wallet' && (user?.walletBalance || 0) < (selectedRestaurant.price * parseInt(formData.customers) * 0.2);
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      disabled={isWalletInsufficient}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : isWalletInsufficient
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-6 w-6 text-gray-600 mr-3" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{method.name}</h5>
                          <p className={`text-sm ${isWalletInsufficient ? 'text-red-500' : 'text-gray-600'}`}>
                            {isWalletInsufficient ? 'Insufficient balance' : method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Restaurant: {selectedRestaurant.name}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Customers: {formData.customers}</p>
                <p>Phone: {formData.phone}</p>
               <p>Total: ₹{(selectedRestaurant.price * parseInt(formData.customers)).toFixed(2)}</p>
                <p className="font-medium text-blue-600">
                 Advance: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment Details Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardDetails(prev => ({ ...prev, number: formatted }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength={19}
                />
                {cardDetails.number && !validateCardNumber(cardDetails.number) && (
                  <p className="text-red-500 text-sm">Please enter a valid 16-digit card number</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setCardDetails(prev => ({ ...prev, expiry: formatted }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const formatted = formatCVV(e.target.value);
                      setCardDetails(prev => ({ ...prev, cvv: formatted }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={3}
                  />
                </div>
                {cardDetails.expiry && !validateExpiryDate(cardDetails.expiry) && (
                  <p className="text-red-500 text-sm">Please enter a valid expiry date (MM/YY)</p>
                )}
                {cardDetails.cvv && !validateCVV(cardDetails.cvv) && (
                  <p className="text-red-500 text-sm">Please enter a valid 3-digit CVV</p>
                )}
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 mb-6">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Enter UPI ID (example@upi)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <Wallet className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Payment via Tabuloo Wallet</p>
                    <p className="text-sm text-green-700">
                      ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)} will be deducted from your wallet
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <Banknote className="h-6 w-6 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-900">Cash on Arrival</p>
                    <p className="text-sm text-orange-700">
                      Pay ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)} when you arrive at the restaurant
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Pay ₹{(selectedRestaurant.price * parseInt(formData.customers || '0') * 0.2).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && selectedRestaurant && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your table has been successfully booked. Confirmation details have been sent to your email and the restaurant.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Restaurant: {selectedRestaurant.name}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Customers: {formData.customers}</p>
                <p>Phone: {formData.phone}</p>
                <p>Advance Paid: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.2).toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTableModal;