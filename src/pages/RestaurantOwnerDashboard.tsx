import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Clock, DollarSign, Users, Package, Eye, EyeOff, ToggleLeft, ToggleRight, Edit, X, Trash2, AlertTriangle, Calendar, PartyPopper, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const RestaurantOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { restaurants, menuItems, orders, bookings, addMenuItem, updateMenuItem, updateOrderStatus, updateRestaurantStatus, updateMenuItemAvailability, deleteMenuItem } = useApp();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'menu' | 'settings'>('orders');

  // Get current restaurant data
  const currentRestaurant = restaurants.find(r => r.id === user?.restaurantId);
  const restaurantMenuItems = menuItems.filter(item => item.restaurantId === user?.restaurantId);
  const restaurantOrders = orders.filter(order => order.restaurantId === user?.restaurantId);
  const restaurantBookings = bookings.filter(booking => booking.restaurantId === user?.restaurantId);

  const [menuFormData, setMenuFormData] = useState({
    category: 'veg' as 'veg' | 'non-veg',
    name: '',
    itemCategory: '',
    quantity: '',
    price: '',
    image: ''
  });

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!menuFormData.name || !menuFormData.itemCategory || !menuFormData.quantity || !menuFormData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!user?.restaurantId) return;

    const newMenuItem = {
      restaurantId: user.restaurantId,
      category: menuFormData.category,
      name: menuFormData.name,
      itemCategory: menuFormData.itemCategory,
      quantity: menuFormData.quantity,
      price: parseFloat(menuFormData.price),
      image: menuFormData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      available: true
    };

    addMenuItem(newMenuItem);
    setShowAddMenu(false);
    setMenuFormData({
      category: 'veg',
      name: '',
      itemCategory: '',
      quantity: '',
      price: '',
      image: ''
    });
  };

  const handleEditMenuItem = (item: any) => {
    setEditingMenuItem(item);
    setMenuFormData({
      category: item.category,
      name: item.name,
      itemCategory: item.itemCategory,
      quantity: item.quantity,
      price: item.price.toString(),
      image: item.image
    });
    setShowEditMenu(true);
  };

  const handleDeleteMenuItem = (item: any) => {
    setDeletingMenuItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMenuItem = () => {
    if (!deletingMenuItem) return;
    
    deleteMenuItem(deletingMenuItem.id);
    setShowDeleteConfirm(false);
    setDeletingMenuItem(null);
    toast.success('Menu item deleted successfully!');
  };

  const cancelDeleteMenuItem = () => {
    setShowDeleteConfirm(false);
    setDeletingMenuItem(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMenuItem) return;

    const updatedMenuItem = {
      ...editingMenuItem,
      category: menuFormData.category,
      name: menuFormData.name,
      itemCategory: menuFormData.itemCategory,
      quantity: menuFormData.quantity,
      price: parseFloat(menuFormData.price),
      image: menuFormData.image || editingMenuItem.image
    };

    updateMenuItem(updatedMenuItem);
    setShowEditMenu(false);
    setEditingMenuItem(null);
    setMenuFormData({
      category: 'veg',
      name: '',
      itemCategory: '',
      quantity: '',
      price: '',
      image: ''
    });
    toast.success('Menu item updated successfully!');
  };

  const closeEditForm = () => {
    setShowEditMenu(false);
    setEditingMenuItem(null);
    setMenuFormData({
      category: 'veg',
      name: '',
      itemCategory: '',
      quantity: '',
      price: '',
      image: ''
    });
  };

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus).catch((error) => {
      console.error('Error updating order status:', error);
    });
  };

  const handleRestaurantToggle = () => {
    if (!currentRestaurant) return;
    updateRestaurantStatus(currentRestaurant.id, !currentRestaurant.isOpen).catch((error) => {
      console.error('Error updating restaurant status:', error);
    });
  };

  const itemCategories = [
    'pastry', 'ice cream', 'tiffin', 'biryani', 'fried rice', 'curry', 'appetizer', 
    'main course', 'dessert', 'beverage', 'pizza', 'burger', 'sandwich'
  ];

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant Not Found</h2>
          <p className="text-gray-600 mt-2">Unable to find your restaurant data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{currentRestaurant.name}</h1>
          <p className="text-gray-600 mt-2">Restaurant Owner Dashboard</p>
        </div>

        {/* Restaurant Status Toggle */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Status</h3>
              <p className="text-gray-600">Control your restaurant's availability</p>
            </div>
            <button
              onClick={handleRestaurantToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentRestaurant.isOpen
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {currentRestaurant.isOpen ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              <span>{currentRestaurant.isOpen ? 'Open' : 'Closed'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                <p className="text-2xl font-bold text-gray-900">{restaurantOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
                <p className="text-2xl font-bold text-gray-900">{restaurantBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Pending Orders</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {restaurantOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Menu Items</h3>
                <p className="text-2xl font-bold text-gray-900">{restaurantMenuItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'orders', label: 'Orders', count: restaurantOrders.length },
                { id: 'bookings', label: 'Bookings', count: restaurantBookings.length },
                { id: 'menu', label: 'Menu', count: restaurantMenuItems.length },
                { id: 'settings', label: 'Settings', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                </div>

                {restaurantOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders found yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restaurantOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">Order #{order.id.slice(-6)}</h4>
                            <p className="text-sm text-gray-600">{order.customerName} • {order.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{order.total}</p>
                            <p className="text-sm text-gray-600">{order.type}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                          </select>
                          
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Table & Event Bookings</h3>
                </div>

                {restaurantBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings found yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restaurantBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              booking.type === 'table' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {booking.type === 'table' ? (
                                <Calendar className={`h-5 w-5 ${
                                  booking.type === 'table' ? 'text-blue-600' : 'text-purple-600'
                                }`} />
                              ) : (
                                <PartyPopper className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center">
                                {booking.type === 'table' ? 'Table Booking' : 'Event Booking'} #{booking.id.slice(-6)}
                                {booking.occasion && (
                                  <span className="ml-2 text-sm text-gray-500">({booking.occasion})</span>
                                )}
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1 mt-1">
                                <p className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {booking.date} at {booking.time}
                                </p>
                                <p className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {booking.customers} {booking.customers === 1 ? 'person' : 'people'}
                                </p>
                                <p className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.phone}
                                </p>
                                {booking.customerNames.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Names: {booking.customerNames.join(', ')}
                                  </p>
                                )}
                                {booking.placeForEvent && (
                                  <p className="flex items-center text-xs text-gray-500">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {booking.placeForEvent}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{booking.amount.toFixed(2)} paid</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        
                        {(booking.specialRequests || booking.description || booking.foodOptions) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                              {booking.description && (
                                <div className="mb-2">
                                  <span className="font-medium text-gray-700">Description: </span>
                                  {booking.description}
                                </div>
                              )}
                              {booking.foodOptions && (
                                <div className="mb-2">
                                  <span className="font-medium text-gray-700">Food Preferences: </span>
                                  {booking.foodOptions}
                                </div>
                              )}
                              {booking.specialRequests && (
                                <div>
                                  <span className="font-medium text-gray-700">Special Requests: </span>
                                  {booking.specialRequests}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Booked on {booking.createdAt.toLocaleDateString()} • Payment: {booking.paymentStatus}
                          </div>
                          <select
                            value={booking.status}
                            onChange={(e) => {
                              // You can add a function to update booking status similar to orders
                              console.log('Update booking status:', booking.id, e.target.value);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
                  <button
                    onClick={() => setShowAddMenu(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantMenuItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                          }}
                        />
                      )}
                      
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.itemCategory} • {item.quantity}</p>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${
                          item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">₹{item.price}</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit menu item"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete menu item"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => updateMenuItemAvailability(item.id, !item.available)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                              item.available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.available ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            <span>{item.available ? 'Available' : 'Unavailable'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Restaurant Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={currentRestaurant.timings}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Type
                      </label>
                      <input
                        type="text"
                        value={currentRestaurant.type}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seating Capacity
                      </label>
                      <input
                        type="number"
                        value={currentRestaurant.capacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Price
                      </label>
                      <input
                        type="text"
                        value={`$${currentRestaurant.price}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Menu Item Modal */}
        {showAddMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Menu Item</h3>
              
              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Category
                    </label>
                    <select
                      value={menuFormData.itemCategory}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, itemCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {itemCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity/Size
                    </label>
                    <input
                      type="text"
                      required
                      value={menuFormData.quantity}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1 plate, 500ml"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={menuFormData.image}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
        {/* Edit Menu Item Modal */}
        {showEditMenu && editingMenuItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Menu Item</h3>
                <button onClick={closeEditForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Category
                    </label>
                    <select
                      value={menuFormData.itemCategory}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, itemCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {itemCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity/Size
                    </label>
                    <input
                      type="text"
                      required
                      value={menuFormData.quantity}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1 plate, 500ml"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={menuFormData.image}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Update Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Menu Item Confirmation Modal */}
        {showDeleteConfirm && deletingMenuItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Menu Item</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{deletingMenuItem.name}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This menu item will be permanently removed from your restaurant.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteMenuItem}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMenuItem}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default RestaurantOwnerDashboard;