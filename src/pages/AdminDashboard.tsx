import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Users, Store, MapPin, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { restaurants, addRestaurant, updateRestaurant, deleteRestaurant } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'restaurant' as 'restaurant' | 'hotel' | 'resort',
    address: '',
    capacity: '',
    crowdCapacity: '',
    images: '',
    price: '',
    ownerUsername: '',
    ownerPassword: '',
    timings: '9:00 AM - 11:00 PM'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.capacity || !formData.crowdCapacity || !formData.price || !formData.ownerUsername || !formData.ownerPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newRestaurant = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
      capacity: parseInt(formData.capacity),
      crowdCapacity: parseInt(formData.crowdCapacity),
      images: formData.images.split(',').map(img => img.trim()),
      price: parseFloat(formData.price),
      ownerCredentials: {
        username: formData.ownerUsername,
        password: formData.ownerPassword
      },
      isOpen: true,
      timings: formData.timings
    };

    addRestaurant(newRestaurant)
      .then(() => {
        setShowAddForm(false);
        setFormData({
          name: '',
          type: 'restaurant',
          address: '',
          capacity: '',
          crowdCapacity: '',
          images: '',
          price: '',
          ownerUsername: '',
          ownerPassword: '',
          timings: '9:00 AM - 11:00 PM'
        });
      })
      .catch((error) => {
        console.error('Error adding restaurant:', error);
        toast.error('Failed to add restaurant. Please try again.');
      });
  };

  const handleEdit = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      type: restaurant.type,
      address: restaurant.address,
      capacity: restaurant.capacity.toString(),
      crowdCapacity: restaurant.crowdCapacity.toString(),
      images: restaurant.images.join(', '),
      price: restaurant.price.toString(),
      ownerUsername: restaurant.ownerCredentials.username,
      ownerPassword: restaurant.ownerCredentials.password,
      timings: restaurant.timings
    });
    setShowEditForm(true);
  };

  const handleDelete = (restaurant: any) => {
    setDeletingRestaurant(restaurant);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deletingRestaurant) return;
    
    deleteRestaurant(deletingRestaurant.id);
    setShowDeleteConfirm(false);
    setDeletingRestaurant(null);
    toast.success('Place deleted successfully!');
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingRestaurant(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRestaurant) return;

    const updatedRestaurant = {
      ...editingRestaurant,
      name: formData.name,
      type: formData.type,
      address: formData.address,
      capacity: parseInt(formData.capacity),
      crowdCapacity: parseInt(formData.crowdCapacity),
      images: formData.images.split(',').map(img => img.trim()),
      price: parseFloat(formData.price),
      ownerCredentials: {
        username: formData.ownerUsername,
        password: formData.ownerPassword
      },
      timings: formData.timings
    };

    updateRestaurant(updatedRestaurant).then(() => {
      setShowEditForm(false);
      setEditingRestaurant(null);
      setFormData({
        name: '',
        type: 'restaurant',
        address: '',
        capacity: '',
        crowdCapacity: '',
        images: '',
        price: '',
        ownerUsername: '',
        ownerPassword: '',
        timings: '9:00 AM - 11:00 PM'
      });
    }).catch((error) => {
      console.error('Error updating restaurant:', error);
    });
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingRestaurant(null);
    setFormData({
      name: '',
      type: 'restaurant',
      address: '',
      capacity: '',
      crowdCapacity: '',
      images: '',
      price: '',
      ownerUsername: '',
      ownerPassword: '',
      timings: '9:00 AM - 11:00 PM'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your restaurant network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Total Customers</h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Store className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Total Restaurants</h3>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{restaurants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Active Places</h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{restaurants.filter(r => r.isOpen).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Place Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Place</span>
          </button>
        </div>

        {/* Add Place Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Add New Place</h2>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name of the Place
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Place
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="resort">Resort</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Serving Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crowd Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.crowdCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, crowdCapacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Images (comma separated URLs)
                    </label>
                    <input
                      type="text"
                      value={formData.images}
                      onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://image1.jpg, https://image2.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Average Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Username
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerUsername: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.ownerPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Place Form Modal */}
        {showEditForm && editingRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Place Details</h2>
                <button onClick={closeEditForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name of the Place
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Place
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="resort">Resort</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Serving Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crowd Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.crowdCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, crowdCapacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Images (comma separated URLs)
                    </label>
                    <input
                      type="text"
                      value={formData.images}
                      onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://image1.jpg, https://image2.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Average Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.timings}
                    onChange={(e) => setFormData(prev => ({ ...prev, timings: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., 9:00 AM - 11:00 PM"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Username
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerUsername: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.ownerPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Update Place
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full mr-3 sm:mr-4">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Place</h3>
                  <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-700">
                  Are you sure you want to delete <strong>{deletingRestaurant.name}</strong>?
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-2">
                  This will also delete all associated menu items, orders, and bookings.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete Place
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Registered Places</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="border rounded-lg p-3 sm:p-4">
                  {restaurant.images[0] && (
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2 sm:mb-3"
                    />
                  )}
                  
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{restaurant.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{restaurant.type}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{restaurant.address}</p>
                  <p className="text-xs sm:text-sm font-medium text-green-600 mb-2 sm:mb-3">₹{restaurant.price}/person</p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                      restaurant.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                    
                    <div className="flex space-x-1 sm:space-x-2">
                      <button 
                        onClick={() => handleEdit(restaurant)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit restaurant"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(restaurant)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete restaurant"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;