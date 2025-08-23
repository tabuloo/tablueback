import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { User, Phone, Mail, MapPin, Clock, Package, Calendar, Settings, Wallet, Plus, ArrowUpRight, ArrowDownLeft, Save, X as XIcon, Edit3 } from 'lucide-react';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../utils/validation';
import AddressForm from '../components/AddressForm';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { user, updateUser, isDefaultUsername } = useAuth();
  const { orders, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'bookings' | 'addresses' | 'wallet'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Sync profileData with user data when user changes
  useEffect(() => {
    if (user) {
      const newProfileData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
      setProfileData(newProfileData);
      setOriginalProfileData(newProfileData);
    }
  }, [user]);

  const userOrders = orders.filter(order => order.userId === user?.id);
  const userBookings = bookings.filter(booking => booking.userId === user?.id);

  // Check if profile data has changed
  const hasProfileChanges = () => {
    return (
      profileData.name !== originalProfileData.name ||
      profileData.phone !== originalProfileData.phone ||
      profileData.email !== originalProfileData.email
    );
  };

  // Validate profile data
  const validateProfileData = () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (profileData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }

    if (profileData.phone && !validateIndianPhoneNumber(profileData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileData()) {
      return;
    }

    setIsUpdating(true);
    
    try {
      // Prepare update data (only include changed fields)
      const updateData: any = {};
      
      if (profileData.name !== originalProfileData.name) {
        updateData.name = profileData.name.trim();
      }
      
      if (profileData.phone !== originalProfileData.phone) {
        updateData.phone = profileData.phone || null;
      }
      
      if (profileData.email !== originalProfileData.email) {
        updateData.email = profileData.email || null;
      }

      // Only update if there are actual changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setEditMode(false);
        return;
      }

      // Update user profile in database
      const success = await updateUser(updateData);
      
      if (success) {
        // Update original data to reflect the new state
        setOriginalProfileData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        });
        
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset profile data to original values
    setProfileData(originalProfileData);
    setEditMode(false);
  };

  const handleSaveAddress = (addressData: any) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...addressData, id: addr.id, isDefault: addr.isDefault } : addr
      ));
      setEditingAddress(null);
    } else {
      // Add new address
      const newAddress = {
        ...addressData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0 // First address becomes default
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your account and view your activity</p>
        </div>

        {/* Default Username Alert */}
        {isDefaultUsername(user.name) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-semibold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Update Your Profile Name
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  You're currently using a temporary username. Please update your name below to personalize your profile and improve your experience.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Current: {user.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
              <p className="text-xs text-gray-600">{user.phone || user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'profile', label: 'Profile', icon: User, count: null },
                { id: 'orders', label: 'Orders', icon: Package, count: userOrders.length },
                { id: 'bookings', label: 'Bookings', icon: Calendar, count: userBookings.length },
                { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
                { id: 'wallet', label: 'Wallet', icon: Wallet, count: null }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center p-2 rounded-lg text-xs transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-center">{tab.label}</span>
                    {tab.count !== null && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded-full mt-1">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.phone || user.email}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Info', icon: User, count: null },
                  { id: 'orders', label: 'My Orders', icon: Package, count: userOrders.length },
                  { id: 'bookings', label: 'My Bookings', icon: Calendar, count: userBookings.length },
                  { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
                  { id: 'wallet', label: 'Wallet', icon: Wallet, count: null }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== null && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border">
              {/* Profile Info Tab */}
              {activeTab === 'profile' && (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Profile Information</h2>
                    <div className="flex items-center space-x-2">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                          >
                            <XIcon className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={handleProfileUpdate}
                            disabled={isUpdating || !hasProfileChanges()}
                            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name *
                        {isDefaultUsername(profileData.name) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Temporary
                          </span>
                        )}
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={isDefaultUsername(profileData.name) ? "Enter your real name" : "Enter your name"}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            isDefaultUsername(profileData.name) 
                              ? 'border-yellow-300 bg-yellow-50 focus:ring-yellow-500' 
                              : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <div className="relative">
                          <p className={`px-3 py-2 rounded-lg text-sm ${
                            isDefaultUsername(profileData.name) 
                              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                              : 'bg-gray-50 text-gray-900'
                          }`}>
                            {profileData.name}
                          </p>
                          {isDefaultUsername(profileData.name) && (
                            <div className="absolute -top-2 -right-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Temporary
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {editMode && profileData.name.trim().length > 0 && profileData.name.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">Name must be at least 2 characters long</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email Address
                      </label>
                      {editMode ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg text-sm">{profileData.email || 'Not provided'}</p>
                      )}
                      {editMode && profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email) && (
                        <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number
                      </label>
                      {editMode ? (
                        <div>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              setProfileData(prev => ({ ...prev, phone: formatted }));
                            }}
                            placeholder="Enter 10-digit phone number"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          {profileData.phone && !validateIndianPhoneNumber(profileData.phone) && (
                            <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit Indian phone number</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg text-sm">{profileData.phone || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Profile Update Summary */}
                    {editMode && hasProfileChanges() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">Changes to be saved:</h4>
                        <div className="text-xs text-blue-700 space-y-1">
                          {profileData.name !== originalProfileData.name && (
                            <p>• Name: {originalProfileData.name} → {profileData.name}</p>
                          )}
                          {profileData.phone !== originalProfileData.phone && (
                            <p>• Phone: {originalProfileData.phone || 'Not set'} → {profileData.phone || 'Not set'}</p>
                          )}
                          {profileData.email !== originalProfileData.email && (
                            <p>• Email: {originalProfileData.email || 'Not set'} → {profileData.email || 'Not set'}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">My Orders</h2>
                  
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-sm">No orders found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {userOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Order #{order.id.slice(-6)}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                {order.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{order.total.toFixed(2)}</p>
                              <span className={`inline-block px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-600">
                            <p>Type: {order.type === 'delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
                            <p>Items: {order.items.length} item(s)</p>
                            {order.address && <p className="truncate">Address: {order.address}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">My Bookings</h2>
                  
                  {userBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-sm">No bookings found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {userBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                {booking.type === 'table' ? 'Table Booking' : 'Event Booking'} #{booking.id.slice(-6)}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                {booking.date} at {booking.time}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{booking.amount.toFixed(2)} paid</p>
                              <span className={`inline-block px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-600">
                            <p>Customers: {booking.customers}</p>
                            <p>Phone: {booking.phone}</p>
                            <p>Payment: {booking.paymentStatus === 'paid' ? 'Advance Paid' : 'Pending'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Saved Addresses</h2>
                    <button 
                      onClick={() => setShowAddAddress(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                  
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                      <p className="text-gray-600 mb-4">Add your first address to get started</p>
                      <button 
                        onClick={() => setShowAddAddress(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-900 text-sm sm:text-base mr-2">{address.label}</h3>
                                {address.isDefault && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 flex items-start text-xs sm:text-sm">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {address.location?.formattedAddress || 
                                    `${address.details.street}, ${address.details.city}, ${address.details.state} ${address.details.pincode}`
                                  }
                                  {address.details.landmark && !address.location?.formattedAddress && ` (${address.details.landmark})`}
                                </span>
                              </p>
                            </div>
                            <div className="flex flex-col space-y-1 ml-2">
                              <button 
                                onClick={() => {
                                  setEditingAddress(address);
                                  setShowAddAddress(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                              >
                                Delete
                              </button>
                              {!address.isDefault && (
                                <button 
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
                                >
                                  Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <div className="p-4 sm:p-6">
                  {/* Coming Soon Page */}
                  <div className="text-center py-12 sm:py-16">
                    <div className="max-w-md mx-auto">
                      {/* Icon */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                      </div>
                      
                      {/* Main Text */}
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Coming Soon!
                      </h2>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
                        We're working hard to bring you an amazing digital wallet experience. 
                        Stay tuned for exciting features like secure payments, instant transfers, 
                        and much more!
                      </p>
                      
                      {/* Features Preview */}
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                          What's Coming:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Secure Digital Wallet</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Instant Money Transfer</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Bill Payments</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Transaction History</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Notification Signup */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm mb-3">
                          Get notified when the wallet launches!
                        </p>
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                            Notify Me
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Form Modal */}
        {showAddAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <AddressForm
                onSave={handleSaveAddress}
                onCancel={() => {
                  setShowAddAddress(false);
                  setEditingAddress(null);
                }}
                initialData={editingAddress}
                isEditing={!!editingAddress}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;