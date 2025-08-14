import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { 
  MapPin, 
  Clock, 
  Package, 
  Navigation, 
  DollarSign, 
  Wifi, 
  WifiOff,
  CheckCircle,
  Truck,
  User,
  Phone,
  Calendar,
  Star,
  Route
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveryOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantName: string;
  restaurantAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
  status: 'assigned' | 'picked_up' | 'on_way' | 'delivered';
  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryTime?: Date;
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  specialInstructions?: string;
}

const DeliveryBoyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useApp();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate assigned orders
    const mockOrders: DeliveryOrder[] = [
      {
        id: '1',
        orderId: 'ORD001',
        customerName: 'John Doe',
        customerPhone: '+91 98765 43210',
        customerAddress: '123 Main St, City Center, Bangalore',
        restaurantName: 'Spice Garden',
        restaurantAddress: '456 Food Court, Mall Road, Bangalore',
        items: [
          { name: 'Butter Chicken', quantity: 2, price: 350 },
          { name: 'Naan', quantity: 4, price: 30 }
        ],
        totalAmount: 820,
        deliveryFee: 50,
        status: 'assigned',
        assignedAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
        specialInstructions: 'Please deliver to the main gate'
      },
      {
        id: '2',
        orderId: 'ORD002',
        customerName: 'Jane Smith',
        customerPhone: '+91 98765 43211',
        customerAddress: '789 Park Avenue, Downtown, Bangalore',
        restaurantName: 'Pizza Palace',
        restaurantAddress: '321 Shopping Complex, High Street, Bangalore',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 450 },
          { name: 'Garlic Bread', quantity: 1, price: 120 }
        ],
        totalAmount: 620,
        deliveryFee: 40,
        status: 'picked_up',
        assignedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        pickedUpAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
        specialInstructions: 'Ring the bell twice'
      }
    ];
    setAssignedOrders(mockOrders);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  }, []);

  // Update location periodically when online
  useEffect(() => {
    let locationInterval: NodeJS.Timeout;
    
    if (isOnline && currentLocation) {
      locationInterval = setInterval(() => {
        // Simulate location updates (in real app, this would send to Firestore)
        const newLat = currentLocation.latitude + (Math.random() - 0.5) * 0.001;
        const newLng = currentLocation.longitude + (Math.random() - 0.5) * 0.001;
        setCurrentLocation({ latitude: newLat, longitude: newLng });
      }, 10000); // Update every 10 seconds
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [isOnline, currentLocation]);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast.success(isOnline ? 'You are now offline' : 'You are now online');
  };

  const updateOrderStatus = (orderId: string, newStatus: DeliveryOrder['status']) => {
    setAssignedOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              ...(newStatus === 'picked_up' && { pickedUpAt: new Date() }),
              ...(newStatus === 'delivered' && { deliveredAt: new Date() })
            }
          : order
      )
    );

    const order = assignedOrders.find(o => o.id === orderId);
    if (order) {
      toast.success(`Order ${order.orderId} status updated to ${newStatus.replace('_', ' ')}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'on_way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Package className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'on_way': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const calculateEarnings = () => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const deliveredOrders = assignedOrders.filter(order => order.status === 'delivered');
    
    const totalEarnings = deliveredOrders.reduce((sum, order) => sum + order.deliveryFee, 0);
    const thisWeekEarnings = deliveredOrders
      .filter(order => order.deliveredAt && order.deliveredAt >= thisWeek)
      .reduce((sum, order) => sum + order.deliveryFee, 0);
    const thisMonthEarnings = deliveredOrders
      .filter(order => order.deliveredAt && order.deliveredAt >= thisMonth)
      .reduce((sum, order) => sum + order.deliveryFee, 0);

    return { total: totalEarnings, thisWeek: thisWeekEarnings, thisMonth: thisMonthEarnings };
  };

  const earnings = calculateEarnings();

  if (!user || user.role !== 'delivery_boy') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Access Denied</h2>
          <p className="text-gray-500">This dashboard is only for delivery personnel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Location:</span>
                {currentLocation ? (
                  <span className="text-sm font-medium text-green-600">
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-sm text-red-600">Getting location...</span>
                )}
              </div>
              
              <button
                onClick={toggleOnlineStatus}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isOnline 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                Earnings Summary
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₹{earnings.total}</p>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">₹{earnings.thisMonth}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">₹{earnings.thisWeek}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
            </div>

            {/* Assigned Orders */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Orders</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {assignedOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No orders assigned yet</p>
                    <p className="text-sm">Stay online to receive orders</p>
                  </div>
                ) : (
                  assignedOrders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-600">{order.restaurantName}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Customer Details
                          </h4>
                          <p className="text-sm text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.customerPhone}</p>
                          <p className="text-sm text-gray-600">{order.customerAddress}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Restaurant
                          </h4>
                          <p className="text-sm text-gray-900">{order.restaurantName}</p>
                          <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-gray-600">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total:</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Delivery Fee:</span>
                            <span>₹{order.deliveryFee}</span>
                          </div>
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</h4>
                          <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            ETA: {order.estimatedDeliveryTime?.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {order.status === 'assigned' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'picked_up')}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {order.status === 'picked_up' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'on_way')}
                              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Start Delivery
                            </button>
                          )}
                          {order.status === 'on_way' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Route className="h-4 w-4" />
                  <span>{showMap ? 'Hide Map' : 'Show Live Map'}</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Navigation className="h-4 w-4" />
                  <span>Update Location</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Package className="h-4 w-4" />
                  <span>View All Orders</span>
                </button>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders Assigned</span>
                  <span className="font-semibold text-blue-600">
                    {assignedOrders.filter(o => o.assignedAt.toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders Delivered</span>
                  <span className="font-semibold text-green-600">
                    {assignedOrders.filter(o => o.status === 'delivered' && o.deliveredAt?.toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Today's Earnings</span>
                  <span className="font-semibold text-green-600">
                    ₹{assignedOrders
                      .filter(o => o.status === 'delivered' && o.deliveredAt?.toDateString() === new Date().toDateString())
                      .reduce((sum, o) => sum + o.deliveryFee, 0)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">Delivery Partner</p>
                  </div>
                </div>
                
                {user.vehicleDetails && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Vehicle: {user.vehicleDetails.type}</p>
                    <p className="text-sm text-gray-600">Number: {user.vehicleDetails.number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Map Section */}
        {showMap && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Location Tracking</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p>Google Maps integration would be here</p>
                <p className="text-sm">Showing real-time location updates</p>
                {currentLocation && (
                  <p className="text-xs mt-2">
                    Current: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
