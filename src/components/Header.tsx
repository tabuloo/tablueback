import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, MapPin, Calendar, ShoppingCart, PartyPopper, Shield, Store } from 'lucide-react';
import BookTableModal from './booking/BookTableModal';
import OrderFoodModal from './booking/OrderFoodModal';
import EventBookingModal from './booking/EventBookingModal';
import AuthModal from './auth/AuthModal';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showBookTable, setShowBookTable] = useState(false);
  const [showOrderFood, setShowOrderFood] = useState(false);
  const [showEventBooking, setShowEventBooking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'admin' | 'restaurant_owner' | 'public_user'>('public_user');

  const handleAuthClick = (type: 'admin' | 'restaurant_owner' | 'public_user') => {
    setAuthType(type);
    setShowAuthModal(true);
  };

  const quickActions = [
    {
      id: 'book-table',
      title: 'Book Table',
      icon: Calendar,
      color: 'text-blue-600 hover:text-blue-700',
      action: () => setShowBookTable(true)
    },
    {
      id: 'order-food',
      title: 'Order Food',
      icon: ShoppingCart,
      color: 'text-green-600 hover:text-green-700',
      action: () => setShowOrderFood(true)
    },
    {
      id: 'event-management',
      title: 'Event Management',
      icon: PartyPopper,
      color: 'text-purple-600 hover:text-purple-700',
      action: () => setShowEventBooking(true)
    }
  ];

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/tabuloo-logo.png" 
                  alt="Tabuloo" 
                  className="h-10 w-auto mr-3"
                />
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-orange-600 mr-2" />
                  <span className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-wide">
                    TABULOO
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions - Only show for public users */}
            {user && user.role === 'public_user' && (
              <div className="hidden md:flex items-center space-x-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-50 ${action.color}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{action.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'public_user' && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 font-medium">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Auth Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('admin')}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                    title="Admin Login"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleAuthClick('restaurant_owner')}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                    title="Restaurant Owner Login (Use credentials from restaurant data)"
                  >
                    <Store className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleAuthClick('public_user')}
                    className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-2 rounded-full hover:from-red-900 hover:to-red-950 transition-all font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {user && showBookTable && (
        <BookTableModal
          isOpen={showBookTable}
          onClose={() => setShowBookTable(false)}
        />
      )}

      {user && showOrderFood && (
        <OrderFoodModal
          isOpen={showOrderFood}
          onClose={() => setShowOrderFood(false)}
        />
      )}

      {user && showEventBooking && (
        <EventBookingModal
          isOpen={showEventBooking}
          onClose={() => setShowEventBooking(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          authType={authType}
        />
      )}
    </>
  );
};

export default Header;