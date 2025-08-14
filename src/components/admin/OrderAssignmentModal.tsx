import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Package, MapPin, Clock, User, Phone, Truck, Navigation, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  vehicleDetails?: {
    type: string;
    number: string;
  };
  rating?: number;
  totalDeliveries?: number;
  distance?: number; // Distance from restaurant
}

const OrderAssignmentModal: React.FC<OrderAssignmentModalProps> = ({ isOpen, onClose, order }) => {
  const { user } = useAuth();
  const { restaurants } = useApp();
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [assignmentMethod, setAssignmentMethod] = useState<'auto' | 'manual'>('auto');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(true);

  // Mock delivery boys data
  useEffect(() => {
    const mockDeliveryBoys: DeliveryBoy[] = [
      {
        id: '1',
        name: 'Rahul Kumar',
        phone: '+91 98765 43210',
        isOnline: true,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          lastUpdated: new Date()
        },
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234'
        },
        rating: 4.8,
        totalDeliveries: 1250,
        distance: 2.3
      },
      {
        id: '2',
        name: 'Amit Singh',
        phone: '+91 98765 43211',
        isOnline: true,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          lastUpdated: new Date()
        },
        vehicleDetails: {
          type: 'scooter',
          number: 'KA01CD5678'
        },
        rating: 4.6,
        totalDeliveries: 890,
        distance: 1.8
      },
      {
        id: '3',
        name: 'Vikram Patel',
        phone: '+91 98765 43212',
        isOnline: true,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          lastUpdated: new Date()
        },
        vehicleDetails: {
          type: 'bike',
          number: 'KA01EF9012'
        },
        rating: 4.9,
        totalDeliveries: 2100,
        distance: 3.1
      },
      {
        id: '4',
        name: 'Suresh Reddy',
        phone: '+91 98765 43213',
        isOnline: false,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          lastUpdated: new Date()
        },
        vehicleDetails: {
          type: 'car',
          number: 'KA01GH3456'
        },
        rating: 4.7,
        totalDeliveries: 1560,
        distance: 4.2
      }
    ];

    // Calculate distances from restaurant (mock calculation)
    const restaurantLocation = {
      latitude: 12.9716,
      longitude: 77.5946
    };

    const deliveryBoysWithDistance = mockDeliveryBoys.map(db => ({
      ...db,
      distance: Math.random() * 5 + 0.5 // Random distance between 0.5-5.5 km
    }));

    setDeliveryBoys(deliveryBoysWithDistance);
  }, []);

  if (!isOpen || !order || !user || user.role !== 'admin') return null;

  const restaurant = restaurants.find(r => r.id === order.restaurantId);
  const availableDeliveryBoys = deliveryBoys.filter(db => db.isOnline);
  const sortedDeliveryBoys = [...availableDeliveryBoys].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleAutoAssignment = async () => {
    if (availableDeliveryBoys.length === 0) {
      toast.error('No delivery boys available at the moment');
      return;
    }

    setIsAssigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assignedDeliveryBoy = sortedDeliveryBoys[0]; // Assign to nearest
      
      // Update order with delivery boy assignment
      // In real app, this would update Firestore
      console.log('Auto-assigning order to:', assignedDeliveryBoy.name);
      
      toast.success(`Order automatically assigned to ${assignedDeliveryBoy.name}`);
      onClose();
    } catch (error) {
      console.error('Auto-assignment error:', error);
      toast.error('Failed to auto-assign order');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleManualAssignment = async () => {
    if (!selectedDeliveryBoy) {
      toast.error('Please select a delivery boy');
      return;
    }

    setIsAssigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assignedDeliveryBoy = deliveryBoys.find(db => db.id === selectedDeliveryBoy);
      
      // Update order with delivery boy assignment
      // In real app, this would update Firestore
      console.log('Manually assigning order to:', assignedDeliveryBoy?.name);
      
      toast.success(`Order assigned to ${assignedDeliveryBoy?.name}`);
      onClose();
    } catch (error) {
      console.error('Manual assignment error:', error);
      toast.error('Failed to assign order');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready_for_pickup': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      case 'picked_up': return 'bg-pink-100 text-pink-800';
      case 'on_way': return 'bg-cyan-100 text-cyan-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready_for_pickup': return <Truck className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'on_way': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Order Assignment</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Order #{order.id}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Restaurant:</strong> {restaurant?.name || 'Unknown'}</p>
                  <p><strong>Order Type:</strong> {order.type || 'Food Delivery'}</p>
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount || order.amount || 0}</p>
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Details
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Name:</strong> {order.customerName || 'N/A'}</p>
                  <p><strong>Phone:</strong> {order.customerPhone || order.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {order.customerAddress || order.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Method</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setAssignmentMethod('auto')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  assignmentMethod === 'auto'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Automatic Assignment</span>
                </div>
                <p className="text-xs mt-1 opacity-75">System finds nearest available delivery boy</p>
              </button>

              <button
                onClick={() => setAssignmentMethod('manual')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  assignmentMethod === 'manual'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Manual Assignment</span>
                </div>
                <p className="text-xs mt-1 opacity-75">Admin selects specific delivery boy</p>
              </button>
            </div>
          </div>

          {assignmentMethod === 'auto' ? (
            /* Automatic Assignment */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Available Delivery Boys</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showNearbyOnly}
                    onChange={(e) => setShowNearbyOnly(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">Show nearby only</span>
                </label>
              </div>

              {availableDeliveryBoys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                  <p>No delivery boys available at the moment</p>
                  <p className="text-sm">All delivery boys are offline or busy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedDeliveryBoys
                    .filter(db => !showNearbyOnly || (db.distance || 0) <= 5)
                    .map((deliveryBoy, index) => (
                      <div
                        key={deliveryBoy.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          index === 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{deliveryBoy.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {deliveryBoy.phone}
                                </span>
                                <span className="flex items-center">
                                  <Truck className="h-3 w-3 mr-1" />
                                  {deliveryBoy.vehicleDetails?.type} - {deliveryBoy.vehicleDetails?.number}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {index === 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                                Nearest Available
                              </span>
                            )}
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {deliveryBoy.distance?.toFixed(1)} km away
                              </p>
                              <p className="text-gray-600">
                                ⭐ {deliveryBoy.rating} ({deliveryBoy.totalDeliveries} deliveries)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <button
                onClick={handleAutoAssignment}
                disabled={isAssigning || availableDeliveryBoys.length === 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? 'Assigning...' : 'Auto-Assign to Nearest Delivery Boy'}
              </button>
            </div>
          ) : (
            /* Manual Assignment */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Delivery Boy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDeliveryBoys.map((deliveryBoy) => (
                  <div
                    key={deliveryBoy.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeliveryBoy === deliveryBoy.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDeliveryBoy(deliveryBoy.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="deliveryBoy"
                        value={deliveryBoy.id}
                        checked={selectedDeliveryBoy === deliveryBoy.id}
                        onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{deliveryBoy.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{deliveryBoy.phone}</p>
                          <p>{deliveryBoy.vehicleDetails?.type} - {deliveryBoy.vehicleDetails?.number}</p>
                          <p>⭐ {deliveryBoy.rating} • {deliveryBoy.totalDeliveries} deliveries</p>
                          <p className="text-red-600 font-medium">
                            {deliveryBoy.distance?.toFixed(1)} km away
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleManualAssignment}
                disabled={isAssigning || !selectedDeliveryBoy}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? 'Assigning...' : 'Assign Selected Delivery Boy'}
              </button>
            </div>
          )}

          {/* Assignment Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Assignment Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• {assignmentMethod === 'auto' ? 'Automatic' : 'Manual'} assignment method selected</p>
              <p>• {availableDeliveryBoys.length} delivery boys currently available</p>
              <p>• Order will be assigned immediately upon confirmation</p>
              <p>• Delivery boy will receive notification and order details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAssignmentModal;
