import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  ShoppingCart, 
  PartyPopper, 
  Star, 
  Clock, 
  Users, 
  ChefHat,
  Utensils,
  Wine,
  Camera,
  Heart,
  Award,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Filter
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import BookTableModal from '../components/booking/BookTableModal';
import OrderFoodModal from '../components/booking/OrderFoodModal';
import EventBookingModal from '../components/booking/EventBookingModal';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { restaurants, menuItems } = useApp();
  const [showBookTable, setShowBookTable] = useState(false);
  const [showOrderFood, setShowOrderFood] = useState(false);
  const [showEventBooking, setShowEventBooking] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'hotel' | 'resort'>('all');

  const quickActions = [
    {
      id: 'book-table',
      title: 'Book Table',
      description: 'Reserve your favorite table',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => setShowBookTable(true)
    },
    {
      id: 'order-food',
      title: 'Order Food',
      description: 'Delivery or pickup options',
      icon: ShoppingCart,
      color: 'bg-green-500',
      action: () => setShowOrderFood(true)
    },
    {
      id: 'event-booking',
      title: 'Event Planning',
      description: 'Organize special occasions',
      icon: PartyPopper,
      color: 'bg-purple-500',
      action: () => setShowEventBooking(true)
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Table Reservations',
      description: 'Book your perfect dining experience with just a few clicks',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: ShoppingCart,
      title: 'Food Delivery',
      description: 'Order delicious meals for delivery or pickup',
      color: 'from-green-400 to-blue-500'
    },
    {
      icon: PartyPopper,
      title: 'Event Planning',
      description: 'Organize memorable celebrations and corporate events',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: ChefHat,
      title: 'Premium Dining',
      description: 'Experience world-class cuisine from top restaurants',
      color: 'from-yellow-400 to-red-700'
    }
  ];

  const stats = [
    { number: '500+', label: 'Restaurants', icon: Utensils },
    { number: '50K+', label: 'Happy Customers', icon: Users },
    { number: '100K+', label: 'Orders Delivered', icon: ShoppingCart },
    { number: '4.9', label: 'Average Rating', icon: Star }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => 
    filterType === 'all' || restaurant.type === filterType
  );

  const openRestaurants = filteredRestaurants.filter(r => r.isOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {user ? (
                    <>
                      <span className="text-gray-900">Welcome back,</span>
                      <br />
                      <span className="bg-gradient-to-r from-red-800 to-red-900 bg-clip-text text-transparent">
                        {user.name}!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-red-800 to-red-900 bg-clip-text text-transparent">
                        Discover
                      </span>
                      <br />
                      <span className="text-gray-900">Amazing Dining</span>
                      <br />
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        Experiences
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                  {user ? (
                    "Ready for your next amazing dining experience? Explore restaurants, book tables, or order your favorite meals."
                  ) : (
                    "From intimate dinners to grand celebrations, Tabuloo connects you with the finest restaurants, seamless reservations, and unforgettable culinary journeys."
                  )}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"
                  alt="Fine dining experience"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">4.9 Rating</span>
                  </div>
                  <p className="text-sm text-gray-600">50,000+ Reviews</p>
                </div>
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-red-800 to-red-900 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="font-bold text-lg">500+</div>
                    <div className="text-sm">Restaurants</div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-10 left-10 animate-bounce">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Calendar className="h-6 w-6 text-red-800" />
                </div>
              </div>
              <div className="absolute bottom-20 right-10 animate-pulse">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if not logged in */}
      {!user && (
        <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{stat.number}</div>
                    <div className="text-red-100">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group"
                  disabled={!user}
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                  {!user && (
                    <p className="text-sm text-red-700 mt-2">Sign in to use this feature</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Places' },
                { value: 'restaurant', label: 'Restaurants' },
                { value: 'hotel', label: 'Hotels' },
                { value: 'resort', label: 'Resorts' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Places</h2>
            <span className="text-gray-600">{openRestaurants.length} places open now</span>
          </div>

          {openRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No places available right now</h3>
              <p className="text-gray-600">Restaurants are being added to our platform. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {restaurant.images[0] && (
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Open
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 capitalize">{restaurant.type}</p>
                    <p className="text-gray-600 text-sm mb-3">{restaurant.address}</p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">4.5</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{restaurant.timings}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-900">₹{restaurant.price}/person</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRestaurant(restaurant.id);
                            setShowBookTable(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          disabled={!user}
                        >
                          Book
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRestaurant(restaurant.id);
                            setShowOrderFood(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          disabled={!user}
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Menu Items */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Menu Items</h2>
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
              <p className="text-gray-600">Restaurant owners can add menu items to showcase their offerings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.filter(item => item.available).slice(0, 8).map((item) => {
              const restaurant = restaurants.find(r => r.id === item.restaurantId);
              if (!restaurant) return null;
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <span className={`w-3 h-3 rounded-full ${
                        item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{restaurant?.name}</p>
                    <p className="text-sm text-gray-600 mb-3">{item.itemCategory} • {item.quantity}</p>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">₹{item.price}</p>
                      <button
                        onClick={() => {
                          setSelectedRestaurant(item.restaurantId);
                          setShowOrderFood(true);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        disabled={!user}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      {/* Features Section - Only show if not logged in */}
      {!user && (
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Perfect Dining
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From quick bites to special celebrations, we've got you covered with our comprehensive platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show if not logged in */}
      {!user && (
        <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Culinary Journey?
              </h2>
              <p className="text-xl text-red-100 mb-8">
                Join thousands of food lovers who trust Tabuloo for their dining experiences
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer - Only show if not logged in */}
      {!user && (
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <img 
                    src="/tabuloo-logo.png" 
                    alt="Tabuloo" 
                    className="h-8 w-auto brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden flex items-center">
                    <MapPin className="h-6 w-6 text-red-700" />
                    <span className="ml-2 text-xl font-bold">Tabuloo</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Your gateway to amazing dining experiences. Book, order, and celebrate with ease.
                </p>
                <div className="flex space-x-4">
                  <Facebook className="h-5 w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                  <Instagram className="h-5 w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                  <Twitter className="h-5 w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Services</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-red-700">Table Reservations</a></li>
                  <li><a href="#" className="hover:text-red-700">Food Delivery</a></li>
                  <li><a href="#" className="hover:text-red-700">Event Planning</a></li>
                  <li><a href="#" className="hover:text-red-700">Corporate Catering</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-red-700">About Us</a></li>
                  <li><a href="#" className="hover:text-red-700">Careers</a></li>
                  <li><a href="#" className="hover:text-red-700">Press</a></li>
                  <li><a href="#" className="hover:text-red-700">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>hello@tabuloo.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>123 Food Street, Culinary City</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Tabuloo. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      {showBookTable && (
        <BookTableModal
          isOpen={showBookTable}
          onClose={() => {
            setShowBookTable(false);
            setSelectedRestaurant('');
          }}
          selectedRestaurantId={selectedRestaurant}
        />
      )}

      {showOrderFood && (
        <OrderFoodModal
          isOpen={showOrderFood}
          onClose={() => {
            setShowOrderFood(false);
            setSelectedRestaurant('');
          }}
          selectedRestaurantId={selectedRestaurant}
        />
      )}

      {showEventBooking && (
        <EventBookingModal
          isOpen={showEventBooking}
          onClose={() => {
            setShowEventBooking(false);
            setSelectedRestaurant('');
          }}
          selectedRestaurantId={selectedRestaurant}
        />
      )}
    </div>
  );
};

export default HomePage;