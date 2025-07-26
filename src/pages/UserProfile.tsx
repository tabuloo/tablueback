import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { User, Phone, Mail, MapPin, Clock, Package, Calendar, Settings, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../utils/validation';

const UserProfile: React.FC = () => {
  const { user, updateWalletBalance } = useAuth();
  const { orders, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'bookings' | 'addresses' | 'wallet'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: '123 Main Street, City, State 12345', isDefault: true },
    { id: '2', label: 'Work', address: '456 Business Ave, Downtown, State 12345', isDefault: false }
  ]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');

  // Mock wallet transactions
  const walletTransactions = [
    { id: '1', type: 'credit', amount: 50.00, description: 'Welcome bonus', date: '2025-01-15', status: 'completed' },
    { id: '2', type: 'debit', amount: 25.50, description: 'Order payment - Golden Spoon', date: '2025-01-14', status: 'completed' },
    { id: '3', type: 'credit', amount: 100.00, description: 'Added money', date: '2025-01-13', status: 'completed' },
    { id: '4', type: 'debit', amount: 15.75, description: 'Table booking advance', date: '2025-01-12', status: 'completed' }
  ];

  const userOrders = orders.filter(order => order.userId === user?.id);
  const userBookings = bookings.filter(booking => booking.userId === user?.id);

  const handleAddMoney = () => {
    const amount = parseFloat(addMoneyAmount);
    if (amount > 0 && user?.walletBalance !== undefined) {
      const newBalance = user.walletBalance + amount;
      updateWalletBalance(newBalance);
      setShowAddMoney(false);
      setAddMoneyAmount('');
      // In a real app, this would integrate with a payment gateway
    }
  };

  const handleProfileUpdate = () => {
    if (profileData.phone && !validateIndianPhoneNumber(profileData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }
    
    // In a real app, this would update the user in the database
    setEditMode(false);
    // You could call updateUser function here
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{editMode ? 'Save Changes' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">{profileData.name}</p>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">{profileData.email || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">{profileData.phone}</p>
                      )}
                    </div>

                    {editMode && (
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileUpdate}
                       onChange={(e) => {
                         const formatted = formatPhoneNumber(e.target.value);
                         setProfileData(prev => ({ ...prev, phone: formatted }));
                       }}
                        >
                       placeholder="Enter 10-digit phone number"
                       maxLength={10}
                          Save Changes
                     {profileData.phone && !validateIndianPhoneNumber(profileData.phone) && (
                       <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
                     )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
                  
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6)}</h3>
                              <p className="text-sm text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {order.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>Type: {order.type === 'delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
                            <p>Items: {order.items.length} item(s)</p>
                            {order.address && <p>Address: {order.address}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bookings</h2>
                  
                  {userBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No bookings found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {booking.type === 'table' ? 'Table Booking' : 'Event Booking'} #{booking.id.slice(-6)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {booking.date} at {booking.time}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{booking.amount.toFixed(2)} paid</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
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
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add New Address
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium text-gray-900 mr-2">{address.label}</h3>
                              {address.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 flex items-start">
                              <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                              {address.address}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Tabuloo Wallet</h2>
                    <button
                      onClick={() => setShowAddMoney(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Money</span>
                    </button>
                  </div>

                  {/* Wallet Balance Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Available Balance</p>
                        <p className="text-3xl font-bold">₹{(user?.walletBalance || 0).toFixed(2)}</p>
                      </div>
                      <Wallet className="h-12 w-12 text-blue-200" />
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => setShowAddMoney(true)}
                        className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        Add Money
                      </button>
                      <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                        Send Money
                      </button>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {walletTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'credit' ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{transaction.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Money to Wallet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAddMoneyAmount(amount.toString())}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddMoney(false);
                    setAddMoneyAmount('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMoney}
                  disabled={!addMoneyAmount || parseFloat(addMoneyAmount) <= 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;