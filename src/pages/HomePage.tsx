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
      color: 'bg-red-800',
      action: () => setShowBookTable(true)
    },
    {
      id: 'order-food',
      title: 'Order Food',
      description: 'Delivery or pickup options',
      icon: ShoppingCart,
      color: 'bg-red-800',
      action: () => setShowOrderFood(true)
    },
    {
      id: 'event-booking',
      title: 'Event Planning',
      description: 'Organize special occasions',
      icon: PartyPopper,
      color: 'bg-red-800',
      action: () => setShowEventBooking(true)
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Table Reservations',
      description: 'Book your perfect dining experience with just a few clicks',
      color: 'from-red-800 to-red-900'
    },
    {
      icon: ShoppingCart,
      title: 'Food Delivery',
      description: 'Order delicious meals for delivery or pickup',
      color: 'from-red-800 to-red-900'
    },
    {
      icon: PartyPopper,
      title: 'Event Planning',
      description: 'Organize memorable celebrations and corporate events',
      color: 'from-red-800 to-red-900'
    },
    {
      icon: ChefHat,
      title: 'Premium Dining',
      description: 'Experience world-class cuisine from top restaurants',
      color: 'from-red-800 to-red-900'
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

  const featuredRestaurants = openRestaurants.slice(0, 6); // Assuming 6 featured restaurants
  const popularMenuItems = menuItems.slice(0, 10); // Assuming 10 popular menu items

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
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
                <p className="text-lg sm:text-xl text-gray-600 mt-4 leading-relaxed">
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
                  className="rounded-lg sm:rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-sm sm:text-base">4.9 Rating</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">50,000+ Reviews</p>
                </div>
                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-gradient-to-r from-red-800 to-red-900 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="font-bold text-base sm:text-lg">500+</div>
                    <div className="text-xs sm:text-sm">Restaurants</div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-6 left-6 sm:top-10 sm:left-10 animate-bounce">
                <div className="bg-white p-2 sm:p-3 rounded-full shadow-lg">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-red-800" />
                </div>
              </div>
              <div className="absolute bottom-12 right-6 sm:bottom-20 sm:right-10 animate-pulse">
                <div className="bg-white p-2 sm:p-3 rounded-full shadow-lg">
                  <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-red-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if not logged in */}
      {!user && (
        <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
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
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold">{stat.number}</div>
                    <div className="text-red-100 text-sm sm:text-base">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Quick Actions Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
                  disabled={!user}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${action.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                  {!user && (
                    <p className="text-xs text-red-700 mt-1">Sign in to use this feature</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
              <span className="text-sm sm:text-base font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Places' },
                { value: 'restaurant', label: 'Restaurants' },
                { value: 'hotel', label: 'Hotels' },
                { value: 'resort', label: 'Resorts' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filterType === filter.value
                      ? 'bg-red-800 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Places Section */}
        <section className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Featured Places
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Discover the best restaurants, hotels, and food places in your area
            </p>
          </div>

          {/* Mobile: 2 items per row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {featuredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={restaurant.images[0]}
                  alt={restaurant.name}
                  className="w-full h-32 sm:h-40 object-cover rounded-t-lg"
                />
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{restaurant.name}</h3>
                    <span className={`px-1 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 capitalize">{restaurant.type}</p>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">{restaurant.address}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-red-800">₹{restaurant.price}</span>
                    <button className="bg-gradient-to-r from-red-800 to-red-900 text-white px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm hover:from-red-900 hover:to-red-950 transition-colors">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Menu Items Section */}
        <section className="py-8 sm:py-12 bg-gray-50 rounded-lg">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Popular Menu Items
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Explore delicious dishes from our partner restaurants
            </p>
          </div>

          {/* Mobile: 2 items per row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {popularMenuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-28 sm:h-36 object-cover rounded-t-lg"
                />
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.itemCategory} • {item.quantity}</p>
                    </div>
                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ml-1 ${
                      item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">₹{item.price}</span>
                    <button className="bg-gradient-to-r from-red-800 to-red-900 text-white px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm hover:from-red-900 hover:to-red-950 transition-colors">
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Features Section - Only show if not logged in */}
      {!user && (
        <section id="features" className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Everything You Need for Perfect Dining
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                From quick bites to special celebrations, we've got you covered with our comprehensive platform
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show if not logged in */}
      {!user && (
        <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
                Ready to Start Your Culinary Journey?
              </h2>
              <p className="text-lg sm:text-xl text-red-100 mb-6 sm:mb-8">
                Join thousands of food lovers who trust Tabuloo for their dining experiences
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer - Only show if not logged in and on larger screens */}
      {!user && (
        <footer className="hidden md:block bg-gray-900 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <img 
                    src="/tabuloo-logo.png" 
                    alt="Tabuloo" 
                    className="h-6 w-auto sm:h-8 brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden flex items-center">
                    <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-red-700" />
                    <span className="ml-2 text-lg sm:text-xl font-bold">Tabuloo</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                  Your gateway to amazing dining experiences. Book, order, and celebrate with ease.
                </p>
                <div className="flex space-x-3 sm:space-x-4">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-red-700 cursor-pointer" />
                </div>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li><a href="#" className="hover:text-red-700">Table Reservations</a></li>
                  <li><a href="#" className="hover:text-red-700">Food Delivery</a></li>
                  <li><a href="#" className="hover:text-red-700">Event Planning</a></li>
                  <li><a href="#" className="hover:text-red-700">Corporate Catering</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li><a href="#" className="hover:text-red-700">About Us</a></li>
                  <li><a href="#" className="hover:text-red-700">Careers</a></li>
                  <li><a href="#" className="hover:text-red-700">Press</a></li>
                  <li><a href="#" className="hover:text-red-700">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
                <div className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span>hello@tabuloo.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span>123 Food Street, Culinary City</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
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