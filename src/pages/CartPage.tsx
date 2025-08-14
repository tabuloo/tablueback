import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingCart, MapPin, User, Phone, Home, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';
import GoogleMapPicker from '../components/GoogleMapPicker';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../utils/validation';

interface Location {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { addOrder } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setDeliveryAddress(location.formattedAddress);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      toast.error('Please enter a complete delivery address (minimum 10 characters)');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    if (!validateIndianPhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        userId: user.id,
        restaurantId: items[0]?.restaurantId || '',
        items: items.map(item => ({
          id: item.id,
          restaurantId: item.restaurantId,
          category: item.category,
          name: item.name,
          itemCategory: item.itemCategory,
          quantity: item.quantity.toString(),
          price: item.price,
          image: item.image,
          available: true
        })),
        status: (paymentMethod === 'cod' ? 'pending' : 'confirmed') as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed',
        type: 'delivery' as const,
        total: getTotalPrice(),
        address: deliveryAddress,
        customerName: customerName,
        customerPhone: phoneNumber,
        createdAt: new Date(),
        paymentMethod: (paymentMethod === 'cod' ? 'cod' : 'card') as 'cod' | 'card' | 'wallet' | 'netbanking' | 'upi',
        location: selectedLocation ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        } : null
      };

      if (paymentMethod === 'cod') {
        // Cash on delivery - directly create order
        await addOrder(orderData);
        clearCart();
        toast.success('Order placed successfully! You will pay on delivery.');
        navigate('/profile');
             } else {
         // Razorpay payment
         await paymentService.initializePayment(
           orderData,
           user,
           async (paymentResponse: any) => {
             try {
               const verificationResponse = await paymentService.verifyPayment(
                 paymentResponse.razorpay_payment_id,
                 paymentResponse.razorpay_order_id
               );
               
               if (verificationResponse.success) {
                 await addOrder(orderData);
                 clearCart();
                 toast.success('Payment successful! Order placed.');
                 navigate('/profile');
               } else {
                 toast.error('Payment verification failed. Please contact support.');
               }
             } catch (error) {
               console.error('Payment verification error:', error);
               toast.error('Payment verification failed. Please contact support.');
             }
           },
           (error: any) => {
             console.error('Payment error:', error);
             toast.error('Payment failed. Please try again.');
           }
         );
       }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNC4yNjgxIDIwIDE4IDI2LjI2ODEgMTggMzRDMjAgMzQgMjIgMzUuMzQzMSAyMiAzOEMyMiA0MC42NTY5IDIwLjY1NjkgNDIgMTggNDJIMTZDMjQuMjY4MSA0MiAzMiAzNC4yNjgxIDMyIDI2VjIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.restaurantName}</p>
                    <p className="text-sm text-gray-500">{item.itemCategory}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-lg">₹{item.price * item.quantity}</p>
                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2 text-red-600" />
                Delivery Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhoneNumber(formatted);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                    {phoneNumber && !validateIndianPhoneNumber(phoneNumber) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      placeholder="Enter your delivery address"
                    />
                  </div>

                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Show Map & Pick Location'}
                  </button>
                </div>
              </div>

              {/* Google Map */}
              {showMap && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <GoogleMapPicker
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for your delivery address..."
                  />
                </div>
              )}

              {/* Selected Location Display */}
              {selectedLocation && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">📍 Selected Location:</p>
                      <p className="text-sm text-green-800 mt-1">{selectedLocation.formattedAddress}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <span className="font-medium">Pay Online</span>
                      <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹40</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-xl">
                    <span>Total</span>
                    <span>₹{getTotalPrice() + 40}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-red-800 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isProcessing ? 'Processing...' : `Place Order (₹${getTotalPrice() + 40})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 