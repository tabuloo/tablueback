import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock, Users, PartyPopper, CreditCard, Plus, Trash2, CheckCircle, Wallet, Building, Smartphone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber, validateCardNumber, formatCardNumber, validateCVV, formatCVV, validateExpiryDate, formatExpiryDate } from '../../utils/validation';

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurantId?: string;
}

const EventBookingModal: React.FC<EventBookingModalProps> = ({ isOpen, onClose, selectedRestaurantId }) => {
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
    occasion: '',
    date: '',
    time: '',
    customers: '1',
    customerNames: [''],
    phone: user?.phone || '',
    placeForEvent: '',
    description: '',
    specialRequests: ''
  });

  const paymentMethods = [
    { id: 'wallet', name: 'Tabuloo Wallet', icon: Wallet, description: `Balance: ₹${(user?.walletBalance || 0).toFixed(2)}` },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks supported' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
    { id: 'cod', name: 'Cash on Arrival', icon: Banknote, description: 'Pay when you arrive for the event' }
  ];

  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurantId);

  const occasions = [
    'Birthday Party', 'Anniversary', 'Wedding Reception', 'Corporate Event',
    'Baby Shower', 'Graduation Party', 'Holiday Celebration', 'Reunion',
    'Business Meeting', 'Product Launch', 'Engagement Party', 'Retirement Party',
    'Housewarming', 'Festival Celebration', 'Other'
  ];

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
      toast.error('Please select a venue');
      return false;
    }

    if (!formData.occasion || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
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
    if (customerCount > selectedRestaurant.crowdCapacity) {
      toast.error(`Venue capacity is limited to ${selectedRestaurant.crowdCapacity} people`);
      return false;
    }

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
        toast.error('Please provide names for all attendees');
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

    const baseAmount = selectedRestaurant.price * parseInt(formData.customers);
    const eventSurcharge = baseAmount * 0.5; // 50% surcharge for events
    const totalAmount = baseAmount + eventSurcharge;
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
      type: 'event' as const,
      date: formData.date,
      time: formData.time,
      customers: parseInt(formData.customers),
      customerNames: formData.customerNames.filter(name => name.trim() !== ''),
      phone: formData.phone,
      status: 'confirmed' as const,
      paymentStatus: 'paid' as const,
      amount: advanceAmount,
      createdAt: new Date(),
      occasion: formData.occasion,
      placeForEvent: formData.placeForEvent,
      description: formData.description,
      specialRequests: formData.specialRequests,
      paymentMethod: paymentMethod
    };

    try {
      await addBooking(booking);
      
      // Simulate email sending
      await sendEventEmails(booking, selectedRestaurant, user);
      
      setStep('confirmation');
    } catch (error) {
      console.error('Event booking error:', error);
    }
  };

  const sendEventEmails = async (booking: any, restaurant: any, user: any) => {
    // Simulate email sending to user and restaurant
    console.log('Sending event booking emails:', {
      userEmail: user.email || user.phone,
      restaurantEmail: restaurant.ownerCredentials.username,
      eventDetails: booking
    });
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <PartyPopper className="h-6 w-6 mr-2 text-purple-600" />
            Event Management & Booking
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue/Restaurant *
                </label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a venue</option>
                  {restaurants.filter(r => r.isOpen).map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - Capacity: {restaurant.crowdCapacity} people
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Persons Attending *
              </label>
              <input
                type="number"
                min="1"
                max={selectedRestaurant?.crowdCapacity || 100}
                required
                value={formData.customers}
                onChange={(e) => handleCustomerCountChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {selectedRestaurant && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum capacity: {selectedRestaurant.crowdCapacity} people
                </p>
              )}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
              {formData.phone && !validateIndianPhoneNumber(formData.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place for the Event
              </label>
              <input
                type="text"
                value={formData.placeForEvent}
                onChange={(e) => setFormData(prev => ({ ...prev, placeForEvent: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Specific area or hall within the venue (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Event Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 inline mr-1" />
                  Customer Details - Name of the Customers
                  {parseInt(formData.customers) > 2 && (
                    <span className="text-sm text-gray-500 ml-1">
                      (Primary contact required, others optional)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={addCustomerField}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Attendee</span>
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.customerNames.map((name, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`Attendee ${index + 1} name${index === 0 && parseInt(formData.customers) > 2 ? ' (required)' : ''}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                Event Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Brief description of your event, theme, or special requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests & Additional Details
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Any special decorations, catering preferences, equipment needs, entertainment requirements, etc..."
              />
            </div>

            {selectedRestaurant && parseInt(formData.customers) > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Event Booking Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Venue: {selectedRestaurant.name}</p>
                  <p>Occasion: {formData.occasion}</p>
                  <p>Date: {formData.date} at {formData.time}</p>
                  <p>Attendees: {formData.customers}</p>
                  <p>Base Cost: ₹{(selectedRestaurant.price * parseInt(formData.customers)).toFixed(2)}</p>
                  <p>Event Surcharge (50%): ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.5).toFixed(2)}</p>
                  <p>Total Amount: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5).toFixed(2)}</p>
                  <p className="font-medium text-purple-600">
                    Advance Payment (20%): ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <span>Book Event</span>
            </button>
          </form>
        )}

        {step === 'payment' && selectedRestaurant && (
          <div className="p-6">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Payment</h3>
              <p className="text-gray-600">
               Advance payment of ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} required
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const advanceAmount = selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2;
                  const isWalletInsufficient = method.id === 'wallet' && (user?.walletBalance || 0) < advanceAmount;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      disabled={isWalletInsufficient}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-purple-500 bg-purple-50'
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
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Event Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Venue: {selectedRestaurant.name}</p>
                <p>Occasion: {formData.occasion}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Attendees: {formData.customers}</p>
                <p>Contact: {formData.phone}</p>
                <p>Total: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5).toFixed(2)}</p>
                <p className="font-medium text-purple-600">
                  Advance: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 mb-6">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} will be deducted from your wallet
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
                      Pay ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} when you arrive for the event
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
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium"
              >
                Pay ₹{(selectedRestaurant.price * parseInt(formData.customers || '0') * 1.5 * 0.2).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && selectedRestaurant && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Booked Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your event has been confirmed. Booking details have been sent to both you and the venue via email.
            </p>
            
            <div className="bg-purple-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Venue: {selectedRestaurant.name}</p>
                <p>Occasion: {formData.occasion}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Attendees: {formData.customers}</p>
                <p>Contact: {formData.phone}</p>
                <p>Advance Paid: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookingModal;