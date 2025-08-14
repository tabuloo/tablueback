import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock, Users, CreditCard, Plus, Trash2, Wallet, Building, Smartphone, Banknote, Truck, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber, validateCardNumber, formatCardNumber, validateCVV, formatCVV, validateExpiryDate, formatExpiryDate } from '../../utils/validation';

interface BookTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurantId?: string;
}

const BookTableModal: React.FC<BookTableModalProps> = ({ isOpen, onClose, selectedRestaurantId }) => {
  const { user, updateWalletBalance } = useAuth();
  const { restaurants, menuItems, addBooking } = useApp();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'netbanking' | 'card' | 'upi'>('card');
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
  
    // New state for menu selection
  const [selectedMenuItems, setSelectedMenuItems] = useState<{[key: string]: number}>({});

  const paymentMethods = [
    { id: 'wallet', name: 'Tabuloo Wallet', icon: Wallet, description: `Balance: ₹${(user?.walletBalance || 0).toFixed(2)}` },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks supported' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' }
  ];

  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurantId);
  
    // Get menu items for the selected restaurant
  const restaurantMenuItems = menuItems.filter(item => 
    item.restaurantId === formData.restaurantId && item.available
  );

  // Calculate total menu cost based on selected items
  const getTotalMenuCost = () => {
    return Object.entries(selectedMenuItems).reduce((total, [itemId, quantity]) => {
      const menuItem = restaurantMenuItems.find(item => item.id === itemId);
      return total + (menuItem ? menuItem.price * quantity : 0);
    }, 0);
  };

  // Calculate booking price (20% of total menu cost)
  const getBookingPrice = () => {
    const totalMenuCost = getTotalMenuCost();
    return totalMenuCost * 0.2;
  };

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

  // Handle menu item selection
  const handleMenuItemChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelectedItems = { ...selectedMenuItems };
      delete newSelectedItems[itemId];
      setSelectedMenuItems(newSelectedItems);
    } else {
      setSelectedMenuItems(prev => ({
        ...prev,
        [itemId]: quantity
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
    
    // Validation logic for customer names
    if (customerCount === 1) {
      // For 1 person: only first name required
      if (!formData.customerNames[0]?.trim()) {
        toast.error('Please provide the customer name');
        return false;
      }
    } else if (customerCount === 2 || customerCount === 3) {
      // For 2-3 people: all names required
      const filledNames = formData.customerNames.filter(name => name.trim() !== '');
      if (filledNames.length !== customerCount) {
        toast.error('Please provide names for all customers');
        return false;
      }
    } else if (customerCount > 3) {
      // For 4+ people: first 2 names mandatory, 3rd optional
      if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
        toast.error('Please provide names for at least the first two customers');
        return false;
      }
    }

    // Check if at least one menu item is selected
    if (Object.keys(selectedMenuItems).length === 0) {
      toast.error('Please select at least one menu item');
      return false;
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

    const totalMenuCost = getTotalMenuCost();
    const advanceAmount = getBookingPrice(); // 20% of total menu cost

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < advanceAmount) {
        toast.error('Insufficient wallet balance');
        return false;
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
      paymentMethod: paymentMethod,
      selectedMenuItems: selectedMenuItems // Add selected menu items to booking
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book Table</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name of the Restaurant *
              </label>
              <select
                value={formData.restaurantId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, restaurantId: e.target.value }));
                  setSelectedMenuItems({}); // Clear selected menu items when restaurant changes
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                required
              >
                <option value="">Select a restaurant</option>
                {restaurants.filter(r => r.isOpen).map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Selection Section */}
            {selectedRestaurant && restaurantMenuItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Utensils className="h-4 w-4 inline mr-1" />
                  Select Menu Items *
                </label>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">
                    Choose the food items you'd like to eat when you arrive. The booking price will be 20% of your total selection.
                  </p>
                  <div className="space-y-3">
                    {restaurantMenuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{item.itemCategory} • {item.quantity}</p>
                          <p className="text-sm font-medium text-red-800">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleMenuItemChange(item.id, (selectedMenuItems[item.id] || 0) - 1)}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                          >
                            <span className="text-lg font-bold">-</span>
                          </button>
                          <span className="w-8 text-center font-medium">
                            {selectedMenuItems[item.id] || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMenuItemChange(item.id, (selectedMenuItems[item.id] || 0) + 1)}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {Object.keys(selectedMenuItems).length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Selected items: {Object.values(selectedMenuItems).reduce((sum, qty) => sum + qty, 0)}</p>
                    <p className="font-medium text-red-800">
                      Total menu cost: ₹{getTotalMenuCost().toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name of the Customers
                  {parseInt(formData.customers) === 1 && (
                    <span className="text-xs sm:text-sm text-gray-500 ml-1">
                      (Required)
                    </span>
                  )}
                  {parseInt(formData.customers) === 2 && (
                    <span className="text-xs sm:text-sm text-gray-500 ml-1">
                      (Both required)
                    </span>
                  )}
                  {parseInt(formData.customers) === 3 && (
                    <span className="text-xs sm:text-sm text-gray-500 ml-1">
                      (All three required)
                    </span>
                  )}
                  {parseInt(formData.customers) > 3 && (
                    <span className="text-xs sm:text-sm text-gray-500 ml-1">
                      (First 2 required, 3rd optional)
                    </span>
                  )}
                </label>
                {parseInt(formData.customers) <= 3 && (
                  <button
                    type="button"
                    onClick={addCustomerField}
                    className="flex items-center space-x-1 text-red-800 hover:text-red-900 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Customer</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {formData.customerNames.map((name, index) => {
                  const customerCount = parseInt(formData.customers);
                  let isRequired = false;
                  let placeholder = '';
                  
                  if (customerCount === 1) {
                    isRequired = index === 0;
                    placeholder = 'Customer name (required)';
                  } else if (customerCount === 2 || customerCount === 3) {
                    isRequired = true;
                    placeholder = `Customer ${index + 1} name (required)`;
                  } else if (customerCount > 3) {
                    if (index === 0 || index === 1) {
                      isRequired = true;
                      placeholder = `Customer ${index + 1} name (required)`;
                    } else if (index === 2) {
                      isRequired = false;
                      placeholder = `Customer ${index + 1} name (optional)`;
                    } else {
                      isRequired = false;
                      placeholder = `Customer ${index + 1} name`;
                    }
                  }
                  
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                        required={isRequired}
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
                  );
                })}
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                rows={3}
                placeholder="Any specific food preferences, dietary restrictions, or additional menu requests..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                rows={3}
                placeholder="Any special arrangements, celebrations, or additional requests..."
              />
            </div>

            {selectedRestaurant && Object.keys(selectedMenuItems).length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Restaurant: {selectedRestaurant.name}</p>
                  <p>Date: {formData.date} at {formData.time}</p>
                  <p>Customers: {formData.customers}</p>
                  <p>Selected Items: {Object.values(selectedMenuItems).reduce((sum, qty) => sum + qty, 0)}</p>
                  <p>Total Menu Cost: ₹{getTotalMenuCost().toFixed(2)}</p>
                  <p className="font-medium text-red-600">
                    Advance Payment (20%): ₹{getBookingPrice().toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 transition-colors flex items-center justify-center space-x-2 font-medium text-base"
            >
              <span>Book Table</span>
            </button>
          </form>
        )}

        {step === 'payment' && selectedRestaurant && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-red-800 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payment Details</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Advance payment of ₹{getBookingPrice().toFixed(2)} required
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isWalletInsufficient = method.id === 'wallet' && (user?.walletBalance || 0) < getBookingPrice();
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      disabled={isWalletInsufficient}
                      className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-red-500 bg-red-50'
                          : isWalletInsufficient
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-3" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm sm:text-base">{method.name}</h5>
                          <p className={`text-xs sm:text-sm ${isWalletInsufficient ? 'text-red-500' : 'text-gray-600'}`}>
                            {isWalletInsufficient ? 'Insufficient balance' : method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
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
                <p>Selected Items: {Object.values(selectedMenuItems).reduce((sum, qty) => sum + qty, 0)}</p>
                <p>Total Menu Cost: ₹{getTotalMenuCost().toFixed(2)}</p>
                <p className="font-medium text-red-600">
                  Advance (20%): ₹{getBookingPrice().toFixed(2)}
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                  maxLength={19}
                />
                {cardDetails.number && !validateCardNumber(cardDetails.number) && (
                  <p className="text-red-500 text-sm">Please enter a valid 16-digit card number</p>
                )}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setCardDetails(prev => ({ ...prev, expiry: formatted }));
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 mb-6">
                <select className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-500 text-xs sm:text-sm">QR Code</span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900 text-sm sm:text-base">Payment via Tabuloo Wallet</p>
                    <p className="text-xs sm:text-sm text-green-700">
                      ₹{getBookingPrice().toFixed(2)} will be deducted from your wallet
                    </p>
                  </div>
                </div>
              </div>
            )}



            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-base"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
              >
                Pay ₹{getBookingPrice().toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && selectedRestaurant && (
          <div className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Your table has been successfully booked. Confirmation details have been sent to your email and the restaurant.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Restaurant: {selectedRestaurant.name}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Customers: {formData.customers}</p>
                <p>Phone: {formData.phone}</p>
                <p>Selected Items: {Object.values(selectedMenuItems).reduce((sum, qty) => sum + qty, 0)}</p>
                <p>Total Menu Cost: ₹{getTotalMenuCost().toFixed(2)}</p>
                <p>Advance Paid: ₹{getBookingPrice().toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
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