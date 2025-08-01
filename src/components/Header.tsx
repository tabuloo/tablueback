import React, { useState } from 'react';
import { MapPin, Menu, X, User, LogOut, Shield, Store, Calendar, ShoppingCart, PartyPopper } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './auth/AuthModal';
import CartIcon from './CartIcon';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookTableModal from './booking/BookTableModal';
import OrderFoodModal from './booking/OrderFoodModal';
import EventBookingModal from './booking/EventBookingModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [showBookTable, setShowBookTable] = useState(false);
  const [showOrderFood, setShowOrderFood] = useState(false);
  const [showEventBooking, setShowEventBooking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'admin' | 'restaurant_owner' | 'public_user'>('public_user');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthClick = (type: 'admin' | 'restaurant_owner' | 'public_user') => {
    setAuthType(type);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout successful!');
    setIsMobileMenuOpen(false);
  };

  const quickActions = [
    {
      id: 'book-table',
      title: 'Book Table',
      icon: Calendar,
      color: 'text-red-800 hover:text-red-900',
      action: () => {
        setShowBookTable(true);
        setIsMobileMenuOpen(false);
      }
    },
    {
      id: 'order-food',
      title: 'Order Food',
      icon: ShoppingCart,
      color: 'text-red-800 hover:text-red-900',
      action: () => {
        setShowOrderFood(true);
        setIsMobileMenuOpen(false);
      }
    },
    {
      id: 'event-management',
      title: 'Event Management',
      icon: PartyPopper,
      color: 'text-red-800 hover:text-red-900',
      action: () => {
        setShowEventBooking(true);
        setIsMobileMenuOpen(false);
      }
    }
  ];

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
                <img 
                  src="/tabuloo-logo.png" 
                  alt="Tabuloo" 
                  className="h-12 w-auto mr-2 sm:h-16 sm:mr-3"
                />
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-800 mr-1 sm:mr-2" />
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-800 to-red-900 bg-clip-text text-transparent tracking-wide">
                    TABULOO
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Quick Actions - Only show for public users */}
              {user && user.role === 'public_user' && (
                <div className="flex items-center space-x-6">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:bg-red-50 ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{action.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Auth Buttons */}
              {!user ? (
                <div className="hidden md:flex items-center space-x-4">
                  {/* Auth Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAuthClick('admin')}
                      className="p-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      title="Admin Login"
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAuthClick('restaurant_owner')}
                      className="p-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      title="Restaurant Owner Login"
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
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  {user.role === 'public_user' && (
                    <>
                      <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <CartIcon />
                        <span className="text-sm font-medium">Cart</span>
                      </button>
                      <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="text-sm font-medium">Profile</span>
                      </button>
                    </>
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
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-red-800"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <div className="p-4 space-y-4">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Quick Actions</h3>
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={() => {
                        action.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      <span className="text-gray-700">{action.title}</span>
                    </button>
                  ))}
                </div>

                {/* Auth Section */}
                {!user ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          handleAuthClick('admin');
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-3 text-center rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        <Shield className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                        <span className="text-xs text-gray-600">Admin</span>
                      </button>
                      <button
                        onClick={() => {
                          handleAuthClick('restaurant_owner');
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-3 text-center rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        <Store className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                        <span className="text-xs text-gray-600">Restaurant</span>
                      </button>
                      <button
                        onClick={() => {
                          handleAuthClick('public_user');
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-3 text-center rounded-lg bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-900 hover:to-red-950 transition-colors"
                      >
                        <User className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Sign In</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account</h3>
                    <div className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-800 font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{user.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    {user.role === 'public_user' && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/cart');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-3" />
                            <span>Cart</span>
                          </div>
                          {itemCount > 0 && (
                            <span className="bg-red-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {itemCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          Profile
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
        </div>
      </header>
    </>
  );
};

export default Header;