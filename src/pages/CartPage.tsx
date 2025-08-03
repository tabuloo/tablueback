import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { addOrder } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter phone number');
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
        customerName: user.name,
        customerPhone: phoneNumber,
        createdAt: new Date(),
        paymentMethod: (paymentMethod === 'cod' ? 'cod' : 'card') as 'cod' | 'card' | 'wallet' | 'netbanking' | 'upi'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNC4yNjgxIDIwIDE4IDI2LjI2ODEgMTggMzRDMjAgMzQgMjIgMzUuMzQzMSAyMiAzOEMyMiA0MC42NTY5IDIwLjY1NjkgNDIgMTggNDJIMTZDMjQuMjY4MSA0MiAzMiAzNC4yNjgxIDMyIDI2VjIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.restaurantName}</p>
                      <p className="text-sm text-gray-500">{item.itemCategory}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Delivery Details */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Delivery Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      placeholder="Enter your delivery address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                      className="mr-2"
                    />
                    <span className="text-sm">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                      className="mr-2"
                    />
                    <span className="text-sm">Pay Online (Razorpay)</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{getTotalPrice() + 40}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-red-800 text-white py-3 rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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