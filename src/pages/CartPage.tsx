import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Banknote,
  Truck,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { items, total, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useApp();
  const navigate = useNavigate();
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup'
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi' | 'wallet'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = deliveryDetails.deliveryType === 'delivery' ? 50 : 0;
  const finalTotal = total + deliveryFee;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (deliveryDetails.deliveryType === 'delivery' && !deliveryDetails.address) {
      toast.error('Please enter delivery address');
      return;
    }

    if (!deliveryDetails.name || !deliveryDetails.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Group items by restaurant
      const itemsByRestaurant = items.reduce((acc, item) => {
        if (!acc[item.restaurantId]) {
          acc[item.restaurantId] = [];
        }
        acc[item.restaurantId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Create orders for each restaurant
      const orderPromises = Object.entries(itemsByRestaurant).map(([restaurantId, restaurantItems]) => {
        const orderData = {
          userId: user.id,
          restaurantId,
          items: restaurantItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity.toString(),
            image: item.image,
            category: item.category,
            itemCategory: item.itemCategory,
            restaurantId: item.restaurantId,
            available: true
          })),
          status: 'pending' as const,
          type: deliveryDetails.deliveryType,
          total: restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          address: deliveryDetails.deliveryType === 'delivery' ? deliveryDetails.address : undefined,
          customerName: deliveryDetails.name,
          customerPhone: deliveryDetails.phone,
          paymentMethod,
          createdAt: new Date()
        };

        return addOrder(orderData);
      });

      await Promise.all(orderPromises);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-3 rounded-lg hover:from-red-900 hover:to-red-950 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-red-800" />
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-red-800 text-white px-2 py-1 rounded-full text-sm font-medium">
              {itemCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Items</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.restaurantName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${
                          item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-gray-500">{item.itemCategory}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">₹{item.price * item.quantity}</div>
                      <div className="text-sm text-gray-500">₹{item.price} each</div>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="delivery"
                        checked={deliveryDetails.deliveryType === 'delivery'}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryType: e.target.value as 'delivery' | 'pickup' }))}
                        className="mr-2"
                      />
                      <Truck className="h-4 w-4 mr-1" />
                      Delivery
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryDetails.deliveryType === 'pickup'}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryType: e.target.value as 'delivery' | 'pickup' }))}
                        className="mr-2"
                      />
                      Pickup
                    </label>
                  </div>
                </div>
                
                {deliveryDetails.deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Delivery Address *
                    </label>
                    <textarea
                      value={deliveryDetails.address}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your delivery address"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {/* Cash on Delivery - Highlighted as default */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'cod' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                }`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <Banknote className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      RECOMMENDED
                    </div>
                  )}
                </label>
                
                {/* Credit/Debit Card */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}>
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                      <p className="text-sm text-gray-600">Secure online payment</p>
                    </div>
                  </div>
                </label>
                
                {/* UPI Payment */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'upi' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <Wallet className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">UPI Payment</span>
                      <p className="text-sm text-gray-600">Pay using UPI apps</p>
                    </div>
                  </div>
                </label>
                
                {/* Digital Wallet */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}>
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <Wallet className="h-6 w-6 text-orange-600 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">Digital Wallet</span>
                      <p className="text-sm text-gray-600">Paytm, PhonePe, etc.</p>
                    </div>
                  </div>
                </label>
              </div>
              
              {/* Payment Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Cash on Delivery is available for orders above ₹100. 
                  For online payments, you'll be redirected to our secure payment gateway.
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-red-800">₹{finalTotal}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {paymentMethod === 'cod' ? 'Pay when you receive your order' : 'Secure online payment'}
                </p>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-4 px-6 rounded-lg hover:from-red-900 hover:to-red-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </div>
                ) : (
                  `Place Order - ₹${finalTotal}`
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 