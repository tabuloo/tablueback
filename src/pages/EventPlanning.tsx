import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  MessageCircle, 
  Eye,
  Target,
  UserCheck,
  TrendingUp,
  Settings,
  BarChart3,
  CreditCard,
  Zap,
  Check,
  X,
  Heart,
  Building,
  PartyPopper,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import PostRequirementModal from '../components/eventPlanning/PostRequirementModal';
import PostServiceModal from '../components/eventPlanning/PostServiceModal';

const EventPlanning: React.FC = () => {
  const { user } = useAuth();
  const { eventRequirements, eventManagers } = useApp();
  const [activeTab, setActiveTab] = useState<'customer' | 'manager'>('customer');
  const [showPostRequirement, setShowPostRequirement] = useState(false);
  const [showPostService, setShowPostService] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories with real counts
  const categories = [
    { id: 'all', name: 'All Events', icon: Calendar, count: eventRequirements.length },
    { id: 'wedding', name: 'Wedding', icon: Heart, count: eventRequirements.filter(r => r.eventType === 'wedding').length },
    { id: 'birthday', name: 'Birthday', icon: Calendar, count: eventRequirements.filter(r => r.eventType === 'birthday').length },
    { id: 'corporate', name: 'Corporate', icon: Building, count: eventRequirements.filter(r => r.eventType === 'corporate').length },
    { id: 'parties', name: 'Parties', icon: PartyPopper, count: eventRequirements.filter(r => r.eventType === 'parties').length },
    { id: 'others', name: 'Others', icon: MoreHorizontal, count: eventRequirements.filter(r => r.eventType === 'others').length }
  ];

  // Filter managers based on selected category
  const filteredManagers = selectedCategory === 'all' 
    ? eventManagers.filter(m => m.status === 'approved')
    : eventManagers.filter(m => m.status === 'approved' && m.categories.includes(selectedCategory));

  const featuredManagers = filteredManagers
    .filter(m => m.featured)
    .slice(0, 6)
    .map(manager => ({
      id: manager.id,
      name: manager.businessName,
      category: manager.categories.join(' & '),
      location: manager.location,
      rating: manager.rating,
      reviews: manager.reviews,
      experience: `${manager.experience}+ years`,
      startingPrice: `₹${manager.pricing.basePrice.toLocaleString()}`,
      image: manager.portfolio.images[0] || '/api/placeholder/300/200',
      verified: manager.verified,
      featured: manager.featured
    }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              Event Planning Made Simple
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-red-100 mb-8 max-w-3xl mx-auto"
            >
              Connect with professional event managers or post your requirements. 
              From intimate gatherings to grand celebrations, we've got you covered.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="flex">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for event managers, services, or requirements..."
                    className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-r-lg transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'customer'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              👤 I Need Event Manager
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'manager'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              👔 I'm an Event Manager
            </button>
          </div>
        </div>

        {/* Customer Side */}
        {activeTab === 'customer' && (
          <div className="space-y-8">
            {/* Key Features Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-2 text-red-600" />
                🔑 Key Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Post a Requirement</h3>
                  <p className="text-sm text-gray-600">Like OLX ad: Event type, date, location, guest count, budget, notes, and optional images.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Browse Managers</h3>
                  <p className="text-sm text-gray-600">Search & filter by location, budget, event type, ratings.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ad Detail Page</h3>
                  <p className="text-sm text-gray-600">Manager profile, services, past events, photos/videos, price packages.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Chat & Call</h3>
                  <p className="text-sm text-gray-600">In-app chat (similar to OLX) to negotiate and discuss.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Book Now</h3>
                  <p className="text-sm text-gray-600">Secure booking with integrated payment gateway (Razorpay/Stripe).</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Track Events</h3>
                  <p className="text-sm text-gray-600">Timeline & reminders.</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <button
                onClick={() => setShowPostRequirement(true)}
                className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="h-6 w-6 mr-2" />
                Post Your Requirement
              </button>
            </motion.div>

            {/* Categories */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <category.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.count} services</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Featured Managers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Event Managers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredManagers.map((manager) => (
                  <div key={manager.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={manager.image} 
                        alt={manager.name}
                        className="w-full h-48 object-cover"
                      />
                      {manager.featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {manager.verified && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm font-medium">{manager.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{manager.category}</p>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {manager.location}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">{manager.experience} experience</span>
                        <span className="text-sm text-gray-500">{manager.reviews} reviews</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-600">Starting from {manager.startingPrice}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                          View Profile
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Manager Side */}
        {activeTab === 'manager' && (
          <div className="space-y-8">
            {/* Key Features Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-2 text-red-600" />
                🔑 Key Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create Verified Profile</h3>
                  <p className="text-sm text-gray-600">Build trust with verified credentials and professional portfolio.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Post Services</h3>
                  <p className="text-sm text-gray-600">Like OLX seller ad: portfolio, categories, packages, availability, pricing.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Receive Leads</h3>
                  <p className="text-sm text-gray-600">Get direct leads from customers posting requirements.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Chat with Customers</h3>
                  <p className="text-sm text-gray-600">In-app communication to discuss requirements and negotiate.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Bookings</h3>
                  <p className="text-sm text-gray-600">Accept/Reject offers and manage your event calendar.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payments Dashboard</h3>
                  <p className="text-sm text-gray-600">Track earnings with commission cuts clearly shown.</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <button
                onClick={() => setShowPostService(true)}
                className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="h-6 w-6 mr-2" />
                Post Your Service
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Post Requirement Modal */}
      <PostRequirementModal
        isOpen={showPostRequirement}
        onClose={() => setShowPostRequirement(false)}
      />

      {/* Post Service Modal */}
      <PostServiceModal
        isOpen={showPostService}
        onClose={() => setShowPostService(false)}
      />
    </div>
  );
};

export default EventPlanning;
