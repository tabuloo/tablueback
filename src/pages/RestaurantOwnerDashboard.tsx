import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Clock, DollarSign, Users, Package, Eye, EyeOff, ToggleLeft, ToggleRight, Edit, X, Trash2, AlertTriangle, Calendar, PartyPopper, Phone, MapPin, Lock, Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatOrderDate, formatBookingDate, formatTime } from '../utils/dateUtils';

const RestaurantOwnerDashboard: React.FC = () => {
  const { user, changeRestaurantOwnerPassword } = useAuth();
  const { restaurants, menuItems, orders, bookings, addMenuItem, updateMenuItem, updateOrderStatus, updateBookingStatus, updateRestaurantStatus, updateMenuItemAvailability, deleteMenuItem, submitRestaurantRegistration } = useApp();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'menu' | 'settings'>('orders');
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updatingStatuses, setUpdatingStatuses] = useState<Set<string>>(new Set());
  const [successUpdates, setSuccessUpdates] = useState<Set<string>>(new Set());

  // Restaurant registration state
  const [registrationForm, setRegistrationForm] = useState({
    restaurantName: '',
    restaurantType: '' as 'restaurant' | 'hotel' | 'resort',
    foodServingCapacity: 0,
    crowdCapacity: 0,
    averagePricePerPerson: 0,
    operatingHours: '',
    ownerEmail: '',
    ownerPhone: '',
    restaurantAddress: '',
    restaurantImages: [] as string[]
  });
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);

  // Menu form state
  const [menuFormData, setMenuFormData] = useState({
    category: 'veg' as 'veg' | 'non-veg',
    name: '',
    itemCategory: '',
    quantity: '',
    price: '',
    image: ''
  });

  // Get current restaurant data
  const currentRestaurant = restaurants.find(r => r.id === user?.restaurantId);
  const restaurantMenuItems = menuItems.filter(item => item.restaurantId === user?.restaurantId);
  const restaurantOrders = orders.filter(order => order.restaurantId === user?.restaurantId);
  const restaurantBookings = bookings.filter(booking => booking.restaurantId === user?.restaurantId);

  // Menu item functions
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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setUpdatingStatuses(prev => new Set(prev).add(orderId));
    updateOrderStatus(orderId, newStatus as any)
      .then(() => {
        // Show success indicator
        setSuccessUpdates(prev => new Set(prev).add(orderId));
        toast.success(`Order status updated to ${newStatus}!`);
        setTimeout(() => {
          setSuccessUpdates(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
          });
        }, 3000); // Hide after 3 seconds
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
      })
      .finally(() => {
        setUpdatingStatuses(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      });
  };

  const handleBookingStatusChange = (bookingId: string, newStatus: string) => {
    setUpdatingStatuses(prev => new Set(prev).add(bookingId));
    updateBookingStatus(bookingId, newStatus as any)
      .then(() => {
        // Show success indicator
        setSuccessUpdates(prev => new Set(prev).add(bookingId));
        toast.success(`Booking status updated to ${newStatus}!`);
        setTimeout(() => {
          setSuccessUpdates(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookingId);
            return newSet;
          });
        }, 3000); // Hide after 3 seconds
      })
      .catch((error) => {
        console.error('Error updating booking status:', error);
        toast.error('Failed to update booking status');
      })
      .finally(() => {
        setUpdatingStatuses(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookingId);
          return newSet;
        });
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    try {
      await changeRestaurantOwnerPassword(passwordForm.newPassword);
      setShowPasswordChange(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleRestaurantRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationForm.restaurantName || !registrationForm.restaurantType || !registrationForm.restaurantAddress || 
        !registrationForm.foodServingCapacity || !registrationForm.crowdCapacity || !registrationForm.averagePricePerPerson ||
        !registrationForm.ownerEmail || !registrationForm.ownerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmittingRegistration(true);
    
    try {
      await submitRestaurantRegistration({
        restaurantName: registrationForm.restaurantName,
        restaurantType: registrationForm.restaurantType,
        restaurantAddress: registrationForm.restaurantAddress,
        foodServingCapacity: registrationForm.foodServingCapacity,
        crowdCapacity: registrationForm.crowdCapacity,
        restaurantImages: registrationForm.restaurantImages,
        averagePricePerPerson: registrationForm.averagePricePerPerson,
        operatingHours: registrationForm.operatingHours,
        ownerEmail: registrationForm.ownerEmail,
        ownerPhone: registrationForm.ownerPhone
      });

      // Send email to admin via serverless API
      const imagesList = registrationForm.restaurantImages && registrationForm.restaurantImages.length > 0 ? registrationForm.restaurantImages.join(', ') : 'N/A';
      const emailHtml = `
        <p>Hello Admin,</p>
        <p>A new restaurant registration request has been submitted. Please verify the details and respond within 24-48 hours.</p>
        <h3>Restaurant Details</h3>
        <ul>
          <li><strong>Name:</strong> ${registrationForm.restaurantName}</li>
          <li><strong>Type:</strong> ${registrationForm.restaurantType}</li>
          <li><strong>Address:</strong> ${registrationForm.restaurantAddress}</li>
          <li><strong>Food Serving Capacity:</strong> ${registrationForm.foodServingCapacity}</li>
          <li><strong>Crowd Capacity:</strong> ${registrationForm.crowdCapacity}</li>
          <li><strong>Avg Price/Person:</strong> ₹${registrationForm.averagePricePerPerson}</li>
          <li><strong>Operating Hours:</strong> ${registrationForm.operatingHours || 'N/A'}</li>
          <li><strong>Images:</strong> ${imagesList}</li>
        </ul>
        <h3>Owner Contact</h3>
        <ul>
          <li><strong>Email:</strong> ${registrationForm.ownerEmail}</li>
          <li><strong>Phone:</strong> ${registrationForm.ownerPhone}</li>
        </ul>
        <h3>Action Required</h3>
        <ol>
          <li>Verify the restaurant and owner's details</li>
          <li>Create owner credentials (username & password)</li>
          <li>Send credentials to owner email above</li>
        </ol>
        <p>Thank you.</p>
      `;

      try {
        const resp = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'tablooofficial1@gmail.com',
            subject: 'New Restaurant Registration Request',
            html: emailHtml,
          }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) {
          throw new Error(data?.error || 'Email failed');
        }
        toast.success('Registration submitted and email notification sent to admin.');
      } catch (emailError) {
        console.error('Email API failed, falling back to Gmail compose:', emailError);
        const subject = encodeURIComponent('New Restaurant Registration Request');
        const body = encodeURIComponent(
          `Hello Admin,\n\nA new restaurant registration request has been submitted.\n\nRestaurant: ${registrationForm.restaurantName}\nType: ${registrationForm.restaurantType}\nAddress: ${registrationForm.restaurantAddress}\nFood Capacity: ${registrationForm.foodServingCapacity}\nCrowd Capacity: ${registrationForm.crowdCapacity}\nAvg Price/Person: ₹${registrationForm.averagePricePerPerson}\nOperating Hours: ${registrationForm.operatingHours || 'N/A'}\nImages: ${imagesList}\n\nOwner Email: ${registrationForm.ownerEmail}\nOwner Phone: ${registrationForm.ownerPhone}\n\nPlease verify and respond with credentials.`
        );
        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=tablooofficial1@gmail.com&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
        toast.success('Registration submitted. Opened email draft to notify admin.');
      }
      
      // Reset form after successful submission
      setRegistrationForm({
        restaurantName: '',
        restaurantType: '' as 'restaurant' | 'hotel' | 'resort',
        foodServingCapacity: 0,
        crowdCapacity: 0,
        averagePricePerPerson: 0,
        operatingHours: '',
        ownerEmail: '',
        ownerPhone: '',
        restaurantAddress: '',
        restaurantImages: []
      });
      
    } catch (error) {
      console.error('Error submitting registration:', error);
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // If user is not logged in or doesn't have a restaurant, show registration form
  if (!user || !currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Registration</h2>
            <p className="text-lg text-gray-600">
              If you haven't registered your restaurant yet, please fill out the form below to request collaboration with us.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Our admin team will review your application and respond within 24-48 hours via email.
            </p>
          </div>

          {/* Already Have Account Section - Top */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Already Have Restaurant Owner Credentials?</h3>
                    <p className="text-sm text-blue-700">You can log in directly to access your restaurant dashboard.</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/auth?role=restaurant_owner'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Login Here
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border p-6 sm:p-8">
            <form onSubmit={handleRestaurantRegistration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationForm.restaurantName}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter restaurant name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the official name of the restaurant</p>
                </div>

                {/* Restaurant Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={registrationForm.restaurantType}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, restaurantType: e.target.value as 'restaurant' | 'hotel' | 'resort' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select the type of establishment</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                  </select>
                </div>

                {/* Food Serving Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Serving Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={registrationForm.foodServingCapacity}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, foodServingCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Number of people"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of people that can be served food</p>
                </div>

                {/* Crowd Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crowd Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={registrationForm.crowdCapacity}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, crowdCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Maximum crowd capacity"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total capacity for events and gatherings</p>
                </div>

                {/* Average Price per Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Price per Person (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={registrationForm.averagePricePerPerson}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, averagePricePerPerson: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Average cost per person"
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical cost per person for a meal</p>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={registrationForm.operatingHours}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, operatingHours: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="9:00 AM - 11:00 PM"
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard operating hours (optional)</p>
                </div>

                {/* Owner Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registrationForm.ownerEmail}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Admin will respond to this email</p>
                </div>

                {/* Owner Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={registrationForm.ownerPhone}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Restaurant Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={registrationForm.restaurantAddress}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter complete restaurant address"
                />
                <p className="text-xs text-gray-500 mt-1">Include street address, city, and state</p>
              </div>

              {/* Restaurant Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Images (comma separated URLs)
                </label>
                <textarea
                  rows={2}
                  value={registrationForm.restaurantImages.join(', ')}
                  onChange={(e) => setRegistrationForm(prev => ({ 
                    ...prev, 
                    restaurantImages: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://image1.jpg, https://image2.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Add image URLs separated by commas</p>
              </div>

              {/* Admin Email Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>• Admin email: <strong>tablooofficial1@gmail.com</strong></p>
                      <p>• Response time: 24-48 hours</p>
                      <p>• After approval, you'll receive login credentials via email</p>
                      <p>• You can change your password after logging in</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingRegistration}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmittingRegistration ? 'Submitting...' : 'Submit Registration Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Already Have Account Section */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Have an Account?</h3>
              <p className="text-gray-600 mb-4">
                If you already have restaurant owner credentials, you can log in to access your dashboard.
              </p>
              <button
                onClick={() => window.location.href = '/auth?role=restaurant_owner'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login to Restaurant Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentRestaurant.name}</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Restaurant Owner Dashboard</p>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </p>
              <p className="text-xs text-gray-400">Data refreshes automatically</p>
            </div>
          </div>
        </div>

        {/* Restaurant Status Toggle */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Restaurant Status</h3>
              <p className="text-gray-600 text-sm">Control your restaurant's availability</p>
            </div>
            <button
              onClick={handleRestaurantToggle}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                currentRestaurant.isOpen
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {currentRestaurant.isOpen ? (
                <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>{currentRestaurant.isOpen ? 'Open' : 'Closed'}</span>
            </button>
          </div>
        </div>

        {/* Today's Revenue Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg sm:rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Today's Revenue Overview</h3>
                <p className="text-sm text-gray-600">Revenue from orders and bookings placed today</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Today's Total Revenue */}
              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Today's Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    ₹{(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      const todayBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt).toDateString() === today.toDateString()
                      );
                      const ordersRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
                      const bookingsRevenue = todayBookings.reduce((sum, booking) => sum + booking.amount, 0);
                      return (ordersRevenue + bookingsRevenue).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      const todayBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt).toDateString() === today.toDateString()
                      );
                      return `${todayOrders.length + todayBookings.length} transactions`;
                    })()}
                  </p>
                  {/* Revenue Trend Indicator */}
                  {(() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    const todayOrders = restaurantOrders.filter(order => 
                      order.createdAt && 
                      new Date(order.createdAt).toDateString() === today.toDateString()
                    );
                    const todayBookings = restaurantBookings.filter(booking => 
                      booking.createdAt && 
                      new Date(booking.createdAt).toDateString() === today.toDateString()
                    );
                    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0) + 
                                       todayBookings.reduce((sum, booking) => sum + booking.amount, 0);
                    
                    const yesterdayOrders = restaurantOrders.filter(order => 
                      order.createdAt && 
                      new Date(order.createdAt).toDateString() === yesterday.toDateString()
                    );
                    const yesterdayBookings = restaurantBookings.filter(booking => 
                      booking.createdAt && 
                      new Date(booking.createdAt).toDateString() === yesterday.toDateString()
                    );
                    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0) + 
                                           yesterdayBookings.reduce((sum, booking) => sum + booking.amount, 0);
                    
                    if (yesterdayRevenue === 0) return null;
                    
                    const change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
                    const isPositive = change >= 0;
                    
                    return (
                      <div className={`mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(1)}% vs yesterday
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Today's Orders Revenue */}
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Orders Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    ₹{(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      return todayOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      return `${todayOrders.length} orders`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Today's Bookings Revenue */}
              <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Bookings Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    ₹{(() => {
                      const today = new Date();
                      const todayBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt).toDateString() === today.toDateString()
                      );
                      return todayBookings.reduce((sum, booking) => sum + booking.amount, 0).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const today = new Date();
                      const todayBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt).toDateString() === today.toDateString()
                      );
                      return `${todayBookings.length} bookings`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    ₹{(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      if (todayOrders.length === 0) return '0.00';
                      const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
                      return (totalRevenue / todayOrders.length).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const today = new Date();
                      const todayOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt).toDateString() === today.toDateString()
                      );
                      return todayOrders.length > 0 ? 'Per order' : 'No orders today';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown Chart */}
            <div className="mt-6 pt-6 border-t border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Revenue Breakdown</h4>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="space-y-2">
                {(() => {
                  const today = new Date();
                  const todayOrders = restaurantOrders.filter(order => 
                    order.createdAt && 
                    new Date(order.createdAt).toDateString() === today.toDateString()
                  );
                  const todayBookings = restaurantBookings.filter(booking => 
                    booking.createdAt && 
                    new Date(booking.createdAt).toDateString() === today.toDateString()
                  );
                  const ordersRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
                  const bookingsRevenue = todayBookings.reduce((sum, booking) => sum + booking.amount, 0);
                  const totalRevenue = ordersRevenue + bookingsRevenue;
                  
                  if (totalRevenue === 0) {
                    return (
                      <div className="text-center py-4 text-gray-500">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No revenue generated today</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {ordersRevenue > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Orders</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">₹{ordersRevenue.toFixed(2)}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({((ordersRevenue / totalRevenue) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {bookingsRevenue > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Bookings</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">₹{bookingsRevenue.toFixed(2)}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({((bookingsRevenue / totalRevenue) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Total</span>
                          <span className="text-lg font-bold text-green-600">₹{totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Revenue Comparison */}
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Weekly Revenue Comparison</h3>
                <p className="text-sm text-gray-600">Compare this week's revenue with previous weeks</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* This Week */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700 mb-1">This Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-800">
                    ₹{(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      startOfWeek.setHours(0, 0, 0, 0);
                      
                      const thisWeekOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfWeek
                      );
                      const thisWeekBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfWeek
                      );
                      
                      const ordersRevenue = thisWeekOrders.reduce((sum, order) => sum + order.total, 0);
                      const bookingsRevenue = thisWeekBookings.reduce((sum, booking) => sum + booking.amount, 0);
                      return (ordersRevenue + bookingsRevenue).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      startOfWeek.setHours(0, 0, 0, 0);
                      
                      const thisWeekOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfWeek
                      );
                      const thisWeekBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfWeek
                      );
                      
                      return `${thisWeekOrders.length + thisWeekBookings.length} transactions`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Last Week */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">Last Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    ₹{(() => {
                      const today = new Date();
                      const startOfLastWeek = new Date(today);
                      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
                      startOfLastWeek.setHours(0, 0, 0, 0);
                      
                      const endOfLastWeek = new Date(startOfLastWeek);
                      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
                      endOfLastWeek.setHours(23, 59, 59, 999);
                      
                      const lastWeekOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfLastWeek &&
                        new Date(order.createdAt) <= endOfLastWeek
                      );
                      const lastWeekBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfLastWeek &&
                        new Date(booking.createdAt) <= endOfLastWeek
                      );
                      
                      const ordersRevenue = lastWeekOrders.reduce((sum, order) => sum + order.total, 0);
                      const bookingsRevenue = lastWeekBookings.reduce((sum, booking) => sum + booking.amount, 0);
                      return (ordersRevenue + bookingsRevenue).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {(() => {
                      const today = new Date();
                      const startOfLastWeek = new Date(today);
                      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
                      startOfLastWeek.setHours(0, 0, 0, 0);
                      
                      const endOfLastWeek = new Date(startOfLastWeek);
                      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
                      endOfLastWeek.setHours(23, 59, 59, 999);
                      
                      const lastWeekOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfLastWeek &&
                        new Date(order.createdAt) <= endOfLastWeek
                      );
                      const lastWeekBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfLastWeek &&
                        new Date(booking.createdAt) <= endOfLastWeek
                      );
                      
                      return `${lastWeekOrders.length + lastWeekBookings.length} transactions`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Month to Date */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700 mb-1">Month to Date</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-800">
                    ₹{(() => {
                      const today = new Date();
                      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                      
                      const monthToDateOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfMonth
                      );
                      const monthToDateBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfMonth
                      );
                      
                      const ordersRevenue = monthToDateOrders.reduce((sum, order) => sum + order.total, 0);
                      const bookingsRevenue = monthToDateBookings.reduce((sum, booking) => sum + booking.amount, 0);
                      return (ordersRevenue + bookingsRevenue).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {(() => {
                      const today = new Date();
                      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                      
                      const monthToDateOrders = restaurantOrders.filter(order => 
                        order.createdAt && 
                        new Date(order.createdAt) >= startOfMonth
                      );
                      const monthToDateBookings = restaurantBookings.filter(booking => 
                        booking.createdAt && 
                        new Date(booking.createdAt) >= startOfMonth
                      );
                      
                      return `${monthToDateOrders.length + monthToDateBookings.length} transactions`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{restaurantOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{restaurantBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {restaurantOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Menu Items</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{restaurantMenuItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border mb-4 sm:mb-6">
          <div className="border-b">
            <nav className="flex overflow-x-auto px-4 sm:px-6">
              {[
                { id: 'orders', label: 'Orders', count: restaurantOrders.length },
                { id: 'bookings', label: 'Bookings', count: restaurantBookings.length },
                { id: 'menu', label: 'Menu', count: restaurantMenuItems.length },
                { id: 'settings', label: 'Settings', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        false ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        // You can implement today's filter toggle here
                        console.log('Toggle today\'s filter');
                      }}
                    >
                      Today Only
                    </button>
                    <span className="text-xs text-gray-600">Sort by:</span>
                    <select 
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // You can implement sorting logic here
                        console.log('Sort orders by:', e.target.value);
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        {restaurantOrders.filter(order => 
                          order.createdAt && 
                          new Date(order.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                      <p className="text-xs text-blue-700">Today's Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        {restaurantOrders.filter(order => order.status === 'pending').length}
                      </p>
                      <p className="text-xs text-blue-700">Pending Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        {restaurantOrders.filter(order => order.status === 'completed').length}
                      </p>
                      <p className="text-xs text-blue-700">Completed Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        ₹{restaurantOrders
                          .filter(order => 
                            order.createdAt && 
                            new Date(order.createdAt).toDateString() === new Date().toDateString()
                          )
                          .reduce((sum, order) => sum + order.total, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-700">Today's Revenue</p>
                    </div>
                  </div>
                </div>

                {restaurantOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">No orders found yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restaurantOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Order #{order.id.slice(-6)}</h4>
                              {order.createdAt && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatOrderDate(order.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">{order.customerName} • {order.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{order.total}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{order.type}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="text-xs sm:text-sm text-gray-500">
                            {order.createdAt && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatOrderDate(order.createdAt)} at {formatTime(order.createdAt)}
                              </span>
                            )}
                            {order.statusUpdatedAt && order.statusUpdatedAt !== order.createdAt && (
                              <span className="flex items-center ml-2 text-blue-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Status updated: {formatOrderDate(order.statusUpdatedAt)} at {formatTime(order.statusUpdatedAt)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingStatuses.has(order.id)}
                              className={`px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 ${
                                updatingStatuses.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                            </select>
                            {updatingStatuses.has(order.id) && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                            
                            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs flex items-center space-x-1 ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              <span>{order.status}</span>
                              {successUpdates.has(order.id) && (
                                <span className="text-green-600">✓</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Table & Event Bookings</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        false ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        // You can implement today's filter toggle here
                        console.log('Toggle today\'s filter');
                      }}
                    >
                      Today Only
                    </button>
                    <span className="text-xs text-gray-600">Sort by:</span>
                    <select 
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // You can implement sorting logic here
                        console.log('Sort bookings by:', e.target.value);
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="date">By Date</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-purple-900">
                        {restaurantBookings.filter(booking => 
                          booking.createdAt && 
                          new Date(booking.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                      <p className="text-xs text-purple-700">Today's Bookings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-900">
                        {restaurantBookings.filter(booking => booking.status === 'pending').length}
                      </p>
                      <p className="text-xs text-purple-700">Pending Bookings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-900">
                        {restaurantBookings.filter(booking => booking.status === 'confirmed').length}
                      </p>
                      <p className="text-xs text-purple-700">Confirmed Bookings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-900">
                        ₹{restaurantBookings
                          .filter(booking => 
                            booking.createdAt && 
                            new Date(booking.createdAt).toDateString() === new Date().toDateString()
                          )
                          .reduce((sum, booking) => sum + booking.amount, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-purple-700">Today's Revenue</p>
                    </div>
                  </div>
                </div>

                {restaurantBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">No bookings found yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restaurantBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${
                              booking.type === 'table' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {booking.type === 'table' ? (
                                <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                  booking.type === 'table' ? 'text-blue-600' : 'text-purple-600'
                                }`} />
                              ) : (
                                <PartyPopper className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center">
                                  {booking.type === 'table' ? 'Table Booking' : 'Event Booking'} #{booking.id.slice(-6)}
                                  {booking.occasion && (
                                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">({booking.occasion})</span>
                                  )}
                                </h4>
                                {booking.createdAt && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatBookingDate(booking.createdAt)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1 mt-1">
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
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{booking.amount.toFixed(2)} paid</p>
                            <span className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs flex items-center space-x-1 ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <span>{booking.status}</span>
                              {successUpdates.has(booking.id) && (
                                <span className="text-green-600">✓</span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {(booking.specialRequests || booking.description || booking.foodOptions) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600">
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
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
                          <div className="text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Booked on {formatBookingDate(booking.createdAt)} at {formatTime(booking.createdAt)}
                            </span>
                            {booking.statusUpdatedAt && booking.statusUpdatedAt !== booking.createdAt && (
                              <span className="flex items-center ml-2 text-purple-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Status updated: {formatBookingDate(booking.statusUpdatedAt)} at {formatTime(booking.statusUpdatedAt)}
                              </span>
                            )}
                            <span className="ml-4">Payment: {booking.paymentStatus}</span>
                          </div>
                          <select
                            value={booking.status}
                            onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                            disabled={updatingStatuses.has(booking.id)}
                            className={`px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 ${
                              updatingStatuses.has(booking.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updatingStatuses.has(booking.id) && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Menu Items</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your restaurant's menu items</p>
                  </div>
                  <button
                    onClick={() => setShowAddMenu(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2 text-sm font-medium shadow-lg"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Add Menu Item</span>
                  </button>
                </div>

                {/* Menu Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <p className="text-lg font-bold text-gray-900">{restaurantMenuItems.length}</p>
                    <p className="text-xs text-gray-600">Total Items</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <p className="text-lg font-bold text-green-600">{restaurantMenuItems.filter(item => item.available).length}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <p className="text-lg font-bold text-red-600">{restaurantMenuItems.filter(item => !item.available).length}</p>
                    <p className="text-xs text-gray-600">Unavailable</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <p className="text-lg font-bold text-blue-600">{restaurantMenuItems.filter(item => item.category === 'veg').length}</p>
                    <p className="text-xs text-gray-600">Vegetarian</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {restaurantMenuItems.map((item) => (
                    <div key={item.id} className={`border rounded-lg p-3 sm:p-4 transition-all ${
                      item.available ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      {item.image && (
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-24 sm:h-32 object-cover rounded-lg mb-2 sm:mb-3 transition-all ${
                              !item.available ? 'opacity-50 grayscale' : ''
                            }`}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                            }}
                          />
                          {!item.available && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Unavailable
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-medium text-gray-900 text-sm sm:text-base ${
                            !item.available ? 'line-through text-gray-500' : ''
                          }`}>{item.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{item.itemCategory} • {item.quantity}</p>
                        </div>
                        <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ml-1 ${
                          item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                        }`} title={item.category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold text-gray-900 text-sm sm:text-base ${
                          !item.available ? 'text-gray-500' : ''
                        }`}>₹{item.price}</p>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit menu item"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete menu item"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Availability Toggle - More Prominent */}
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={() => updateMenuItemAvailability(item.id, !item.available)}
                          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                            item.available
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                          }`}
                          title={item.available ? 'Click to mark as unavailable' : 'Click to mark as available'}
                        >
                          {item.available ? (
                            <>
                              <Eye className="h-4 w-4" />
                              <span>Available</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              <span>Unavailable</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {restaurantMenuItems.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
                    <p className="text-gray-600 mb-4">Start building your menu by adding your first item</p>
                    <button
                      onClick={() => setShowAddMenu(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Your First Menu Item</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Restaurant Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={currentRestaurant.timings}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seating Capacity
                      </label>
                      <input
                        type="number"
                        value={currentRestaurant.capacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Price
                      </label>
                      <input
                        type="text"
                        value={`₹${currentRestaurant.price}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Account Security</h4>
                      <p className="text-sm text-gray-600">Change your login password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordChange(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Menu Item Modal */}
        {showAddMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Menu Item</h3>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddMenuItem} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select food type</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={menuFormData.itemCategory}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, itemCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {itemCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Choose item category</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter item name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the name of your menu item</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity/Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={menuFormData.quantity}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., 1 plate, 500ml"
                    />
                    <p className="text-xs text-gray-500 mt-1">Specify quantity or size</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set item price</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Add image URL for better presentation</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium transition-all shadow-lg"
                  >
                    Add Menu Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Menu Item Modal */}
        {showEditMenu && editingMenuItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Menu Item</h3>
                <button onClick={closeEditForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select food type</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={menuFormData.itemCategory}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, itemCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {itemCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Choose item category</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter item name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the name of your menu item</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity/Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={menuFormData.quantity}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., 1 plate, 500ml"
                    />
                    <p className="text-xs text-gray-500 mt-1">Specify quantity or size</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set item price</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium transition-all shadow-lg"
                  >
                    Update Menu Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Menu Item Confirmation Modal */}
        {showDeleteConfirm && deletingMenuItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full mr-3 sm:mr-4">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Menu Item</h3>
                  <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-700">
                  Are you sure you want to delete <strong>{deletingMenuItem.name}</strong>?
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-2">
                  This menu item will be permanently removed from your restaurant.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={cancelDeleteMenuItem}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMenuItem}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                <button 
                  onClick={() => setShowPasswordChange(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard;