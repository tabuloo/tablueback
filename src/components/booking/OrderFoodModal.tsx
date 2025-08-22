import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { X, ShoppingCart, Plus, Minus, MapPin, Truck, CreditCard, CheckCircle, Wallet, Building, Smartphone, Banknote, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber, validateCardNumber, formatCardNumber, validateCVV, formatCVV, validateExpiryDate, formatExpiryDate } from '../../utils/validation';
import GoogleMapPicker from '../GoogleMapPicker';

interface OrderFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurantId?: string;
}

interface CartItem {
  id: string;
  quantity: number;
}

const OrderFoodModal: React.FC<OrderFoodModalProps> = ({ isOpen, onClose, selectedRestaurantId }) => {
  const navigate = useNavigate();
  const { user, updateWalletBalance } = useAuth();
  const { restaurants, menuItems, addOrder } = useApp();
  const { addToCart: addToMainCart } = useCart();
  const [activeRestaurant, setActiveRestaurant] = useState(selectedRestaurantId || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'restaurants' | 'menu' | 'checkout' | 'address' | 'payment' | 'confirmation'>('restaurants');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'netbanking' | 'card' | 'upi' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string, formattedAddress: string} | null>(null);

  const paymentMethods = [
    { id: 'wallet', name: 'Tabuloo Wallet', icon: Wallet, description: `Balance: ₹${(user?.walletBalance || 0).toFixed(2)}` },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks supported' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, description: 'Pay on delivery/pickup' }
  ];

  const availableRestaurants = restaurants.filter(r => r.isOpen);
  const restaurantMenuItems = menuItems.filter(
    item => item.restaurantId === activeRestaurant && item.available
  );

  const addToCart = (itemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem) {
        return prev.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: itemId, quantity: 1 }];
    });
    toast.success('Added to cart!');
  };

  const addToMainCartAndRedirect = (itemId: string) => {
    const menuItem = menuItems.find(item => item.id === itemId);
    if (menuItem) {
      addToMainCart({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        restaurantId: menuItem.restaurantId,
        restaurantName: restaurants.find(r => r.id === activeRestaurant)?.name || '',
        category: menuItem.category,
        itemCategory: menuItem.itemCategory
      });
      
      toast.success('Item added to cart! Redirecting to checkout...');
      
      // Close the modal
      onClose();
      
      // Redirect to cart page after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    }
  };

  const updateCartQuantity = (itemId: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const menuItem = menuItems.find(item => item.id === cartItem.id);
      return total + (menuItem ? menuItem.price * cartItem.quantity : 0);
    }, 0);
  };

  const getCartItems = () => {
    return cart.map(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.id);
      return menuItem ? { ...menuItem, quantity: cartItem.quantity } : null;
    }).filter(Boolean);
  };

  const handleRestaurantSelect = (restaurantId: string) => {
    setActiveRestaurant(restaurantId);
    setCart([]); // Clear cart when switching restaurants
    setStep('menu');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Add all cart items to the main cart
    const cartItems = getCartItems();
    cartItems.forEach((item: any) => {
      if (item) {
        addToMainCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          restaurantId: item.restaurantId,
          restaurantName: restaurants.find(r => r.id === activeRestaurant)?.name || '',
          category: item.category,
          itemCategory: item.itemCategory
        });
      }
    });

    // Show success message
    toast.success('Items added to cart! Redirecting to checkout...');
    
    // Close the modal
    onClose();
    
    // Redirect to cart page after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1000);
  };

  const handleOrderTypeSelection = (type: 'delivery' | 'pickup') => {
    setOrderType(type);
    if (type === 'delivery') {
      setStep('address');
    } else {
      setStep('payment');
    }
  };

  const handleAddressSubmit = () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      toast.error('Please enter a complete delivery address (minimum 10 characters)');
      return;
    }

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }
    if (!validateIndianPhoneNumber(customerDetails.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user || !activeRestaurant) {
      toast.error('Please ensure you are logged in and have selected a restaurant');
      return;
    }

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

    const orderItems = getCartItems() as any[];
    const total = getCartTotal();

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < total) {
        toast.error('Insufficient wallet balance');
        return;
      }
      updateWalletBalance((user.walletBalance || 0) - total);
    }

    const selectedRestaurant = restaurants.find(r => r.id === activeRestaurant);

    const orderData: any = {
      userId: user.id,
      restaurantId: activeRestaurant,
      items: orderItems,
      status: 'pending' as const,
      type: orderType,
      total,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      createdAt: new Date(),
      paymentMethod: paymentMethod
    };

    // Only add address field for delivery orders
    if (orderType === 'delivery') {
      orderData.address = deliveryAddress;
      // Add location coordinates if available
      if (currentLocation) {
        orderData.location = {
          lat: currentLocation.lat,
          lng: currentLocation.lng
        };
      }
    }

    try {
      await addOrder(orderData);
      
      // Simulate email/notification sending
      await sendOrderNotifications(orderData, selectedRestaurant, user);
      
      setStep('confirmation');
    } catch (error) {
      console.error('Order error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    toast.loading('Getting your current location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocode to get address (simplified - in production use Google Geocoding API)
        const address = `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
        setDeliveryAddress(address);
        
        toast.dismiss();
        toast.success('Location captured successfully!');
      },
      (error) => {
        toast.dismiss();
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('Error getting location. Please enter address manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleLocationSelect = (location: {lat: number, lng: number, address: string, formattedAddress: string}) => {
    setSelectedLocation(location);
    setDeliveryAddress(location.formattedAddress);
    setShowMap(false);
    toast.success('Location selected successfully!');
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const sendOrderNotifications = async (order: any, restaurant: any, user: any) => {
    // Simulate sending notifications to user and restaurant
    console.log('Sending order notifications:', {
      userEmail: user.email || user.phone,
      restaurantEmail: restaurant?.ownerCredentials.username,
      orderDetails: order
    });
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Food</h2>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {cart.length > 0 && (
              <div className="flex items-center bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items - ₹{getCartTotal().toFixed(2)}</span>
              </div>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {step === 'restaurants' && (
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Available Restaurants, Hotels & Food Places</h3>
            
            {availableRestaurants.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No restaurants available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {availableRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant.id)}
                    className="border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    {restaurant.images[0] && (
                      <img
                        src={restaurant.images[0]}
                        alt={restaurant.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4 group-hover:scale-105 transition-transform"
                      />
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{restaurant.name}</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Open
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">{restaurant.type}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{restaurant.address}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{restaurant.timings}</p>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-base sm:text-lg font-semibold text-red-800">
                          ₹{restaurant.price}/person
                        </span>
                        <button className="bg-gradient-to-r from-red-800 to-red-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-red-900 hover:to-red-950 transition-colors text-xs sm:text-sm">
                          View Menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'menu' && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
              <div>
                <button
                  onClick={() => setStep('restaurants')}
                  className="text-red-800 hover:text-red-900 mb-2 text-sm sm:text-base"
                >
                  ← Back to Restaurants
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {restaurants.find(r => r.id === activeRestaurant)?.name} Menu
                </h3>
              </div>
              
              {cart.length > 0 && (
                <button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center space-x-2 text-sm sm:text-base mt-2 sm:mt-0"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Proceed to Checkout (₹{getCartTotal().toFixed(2)})</span>
                </button>
              )}
            </div>

            {restaurantMenuItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No menu items available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {restaurantMenuItems.map((item) => {
                  const cartItem = cart.find(c => c.id === item.id);
                  return (
                    <div key={item.id} className="border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4"
                      />
                      
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{item.itemCategory} • {item.quantity}</p>
                          </div>
                          <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                            item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-base sm:text-lg font-semibold text-gray-900">₹{item.price}</span>
                          
                          {cartItem ? (
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-lg font-medium text-xs sm:text-sm">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => addToCart(item.id)}
                                className="bg-gradient-to-r from-red-800 to-red-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-red-900 hover:to-red-950 transition-colors text-xs sm:text-sm"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => addToMainCartAndRedirect(item.id)}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-colors text-xs sm:text-sm"
                              >
                                Add & Checkout
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fixed Cart Summary */}
            {cart.length > 0 && (
              <div className="fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-3 sm:p-4 max-w-xs sm:max-w-sm">
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Use "Add & Checkout" for individual items or "Proceed to Checkout" for all items
                </div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Cart Summary</h4>
                <div className="space-y-1 mb-3 max-h-24 sm:max-h-32 overflow-y-auto">
                  {getCartItems().map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-sm sm:text-base">Total: ₹{getCartTotal().toFixed(2)}</span>
                  <button
                    onClick={handleCheckout}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 text-xs sm:text-sm"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Choose Order Type</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <button
                onClick={() => handleOrderTypeSelection('pickup')}
                className="p-6 sm:p-8 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-red-800 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Self Pickup</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Pick up your order from the restaurant</p>
                  <p className="text-xs sm:text-sm text-green-600 mt-2">No delivery charges</p>
                </div>
              </button>
              
              <button
                onClick={() => handleOrderTypeSelection('delivery')}
                className="p-6 sm:p-8 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="text-center">
                  <Truck className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Home Delivery</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Get it delivered to your doorstep</p>
                  <p className="text-xs sm:text-sm text-orange-600 mt-2">Delivery charges may apply</p>
                </div>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Summary</h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p>Subtotal: ₹{getCartTotal().toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => setStep('menu')}
              className="mt-4 text-red-800 hover:text-red-900 text-sm sm:text-base"
            >
              ← Back to Menu
            </button>
          </div>
        )}

        {step === 'address' && (
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Delivery Address</h3>
            
            <div className="space-y-4 sm:space-y-6">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   <MapPin className="h-4 w-4 inline mr-1" />
                   Full Delivery Address *
                 </label>
                 <textarea
                   value={deliveryAddress}
                   onChange={(e) => setDeliveryAddress(e.target.value)}
                   className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                   rows={4}
                   placeholder="Enter your complete delivery address with landmarks..."
                   required
                 />
                 
                 {/* Location Buttons */}
                 <div className="flex flex-col sm:flex-row gap-3 mt-3">
                   <button
                     type="button"
                     onClick={getCurrentLocation}
                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                   >
                     <Navigation className="h-4 w-4 mr-2" />
                     Use Current Location
                   </button>
                   <button
                     type="button"
                     onClick={toggleMap}
                     className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
                   >
                     <MapPin className="h-4 w-4 mr-2" />
                     {showMap ? 'Hide Map' : 'Show Map & Pick Location'}
                   </button>
                 </div>
                 
                 {/* Map Display */}
                 {showMap && (
                   <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-700 mb-3">Select Location on Map</h4>
                     <GoogleMapPicker
                       onLocationSelect={handleLocationSelect}
                       placeholder="Search for your delivery address..."
                     />
                   </div>
                 )}

                 {/* Selected Location Display */}
                 {selectedLocation && (
                   <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-start">
                       <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                       <div className="flex-1">
                         <p className="text-sm font-medium text-green-900">✅ Location Selected:</p>
                         <p className="text-sm text-green-800 mt-1">{selectedLocation.formattedAddress}</p>
                         <p className="text-xs text-green-700 mt-1">
                           Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                         </p>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Current Location Display */}
                 {currentLocation && (
                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                     <div className="flex items-start">
                       <Navigation className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                       <div className="flex-1">
                         <p className="text-sm font-medium text-blue-900">📍 Current Location Captured:</p>
                         <p className="text-sm text-blue-800 mt-1">
                           Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
                         </p>
                         <p className="text-xs text-blue-700 mt-1">
                           You can edit the address above if needed
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                   onChange={(e) => {
                     const formatted = formatPhoneNumber(e.target.value);
                     setCustomerDetails(prev => ({ ...prev, phone: formatted }));
                   }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                   placeholder="Enter 10-digit phone number"
                   maxLength={10}
                    required
                  />
                 {customerDetails.phone && !validateIndianPhoneNumber(customerDetails.phone) && (
                   <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
                 )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
              <button
                onClick={() => setStep('checkout')}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-base"
              >
                Back
              </button>
              <button
                onClick={handleAddressSubmit}
                className="flex-1 bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-red-800 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payment</h3>
              <p className="text-sm sm:text-base text-gray-600">Complete your order payment</p>
            </div>
            
            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isWalletInsufficient = method.id === 'wallet' && (user?.walletBalance || 0) < getCartTotal();
                  const isCodUnavailable = method.id === 'cod' && orderType === 'pickup';
                  const isDisabled = isWalletInsufficient || isCodUnavailable;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      disabled={isDisabled}
                      className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-red-500 bg-red-50'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-3" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm sm:text-base">{method.name}</h5>
                          <p className={`text-xs sm:text-sm ${isDisabled ? 'text-red-500' : 'text-gray-600'}`}>
                            {isWalletInsufficient ? 'Insufficient balance' : 
                             isCodUnavailable ? 'Not available for pickup' : method.description}
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

            <div className="bg-gray-50 p-4 rounded-lg mb-4 sm:mb-6">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Summary</h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>Order Type: {orderType === 'delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
                {orderType === 'delivery' && <p>Address: {deliveryAddress}</p>}
                <p>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Total: ₹{getCartTotal().toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Details Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-4 sm:mb-6">
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
              <div className="space-y-4 mb-4 sm:mb-6">
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
              <div className="space-y-4 mb-4 sm:mb-6">
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
              <div className="bg-green-50 p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900 text-sm sm:text-base">Payment via Tabuloo Wallet</p>
                    <p className="text-xs sm:text-sm text-green-700">
                      ₹{getCartTotal().toFixed(2)} will be deducted from your wallet
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-900 text-sm sm:text-base">Cash on Delivery</p>
                    <p className="text-xs sm:text-sm text-orange-700">
                      Pay ₹{getCartTotal().toFixed(2)} when your order is delivered
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setStep(orderType === 'delivery' ? 'address' : 'checkout')}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-base"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 font-medium text-base"
              >
               Place Order - ₹{getCartTotal().toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Your order has been confirmed. You'll receive notifications about the order status and delivery updates.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Details</h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>Order Type: {orderType === 'delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
                <p>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p>Total Paid: ₹{getCartTotal().toFixed(2)}</p>
                <p>Status: Order Confirmed</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setCart([]);
                  setStep('restaurants');
                }}
                className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
              >
                Order More Food
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium text-base"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFoodModal;