import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  Package, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Truck, 
  Navigation, 
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

interface DeliveryStatus {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'assigned' | 'picked_up' | 'on_way' | 'delivered';
  timestamp: Date;
  description: string;
  icon: React.ReactNode;
}

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  vehicleDetails?: {
    type: string;
    number: string;
  };
  rating?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  estimatedArrival?: Date;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, order }) => {
  const { user } = useAuth();
  const [deliveryBoy, setDeliveryBoy] = useState<DeliveryBoy | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(order?.status || 'pending');
  const [deliveryProgress, setDeliveryProgress] = useState<number>(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Mock delivery boy data
  useEffect(() => {
    if (order?.status === 'assigned' || order?.status === 'picked_up' || order?.status === 'on_way') {
      const mockDeliveryBoy: DeliveryBoy = {
        id: '1',
        name: 'Rahul Kumar',
        phone: '+91 98765 43210',
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234'
        },
        rating: 4.8,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          lastUpdated: new Date()
        },
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      };
      setDeliveryBoy(mockDeliveryBoy);
      setEstimatedDeliveryTime(mockDeliveryBoy.estimatedArrival);
    }
  }, [order?.status]);

  // Update delivery progress based on status
  useEffect(() => {
    const statusProgress = {
      'pending': 0,
      'confirmed': 10,
      'preparing': 25,
      'ready_for_pickup': 40,
      'assigned': 50,
      'picked_up': 75,
      'on_way': 90,
      'delivered': 100
    };
    setDeliveryProgress(statusProgress[currentStatus as keyof typeof statusProgress] || 0);
  }, [currentStatus]);

  // Simulate status updates for demo
  useEffect(() => {
    if (order?.status === 'confirmed') {
      const timer = setTimeout(() => {
        setCurrentStatus('preparing');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  if (!isOpen || !order) return null;

  const deliverySteps: DeliveryStatus[] = [
    {
      status: 'pending',
      timestamp: new Date(order.createdAt),
      description: 'Order placed successfully',
      icon: <Package className="h-5 w-5" />
    },
    {
      status: 'confirmed',
      timestamp: new Date(order.createdAt.getTime() + 2 * 60 * 1000),
      description: 'Order confirmed by restaurant',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      status: 'preparing',
      timestamp: new Date(order.createdAt.getTime() + 5 * 60 * 1000),
      description: 'Food is being prepared',
      icon: <Package className="h-5 w-5" />
    },
    {
      status: 'ready_for_pickup',
      timestamp: new Date(order.createdAt.getTime() + 15 * 60 * 1000),
      description: 'Food is ready for pickup',
      icon: <Truck className="h-5 w-5" />
    },
    {
      status: 'assigned',
      timestamp: new Date(order.createdAt.getTime() + 17 * 60 * 1000),
      description: 'Delivery partner assigned',
      icon: <User className="h-5 w-5" />
    },
    {
      status: 'picked_up',
      timestamp: new Date(order.createdAt.getTime() + 20 * 60 * 1000),
      description: 'Order picked up by delivery partner',
      icon: <Truck className="h-5 w-5" />
    },
    {
      status: 'on_way',
      timestamp: new Date(order.createdAt.getTime() + 22 * 60 * 1000),
      description: 'Order is on the way',
      icon: <Navigation className="h-5 w-5" />
    },
    {
      status: 'delivered',
      timestamp: new Date(order.createdAt.getTime() + 35 * 60 * 1000),
      description: 'Order delivered successfully',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  const getCurrentStepIndex = () => {
    return deliverySteps.findIndex(step => step.status === currentStatus);
  };

  const getStatusColor = (status: string, isActive: boolean = false) => {
    if (isActive) return 'text-red-600';
    
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'on_way': return 'text-blue-600';
      case 'picked_up': return 'text-purple-600';
      case 'assigned': return 'text-indigo-600';
      case 'ready_for_pickup': return 'text-orange-600';
      case 'preparing': return 'text-yellow-600';
      case 'confirmed': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string, isActive: boolean = false) => {
    if (isActive) return 'bg-red-100 border-red-300';
    
    switch (status) {
      case 'delivered': return 'bg-green-100 border-green-300';
      case 'on_way': return 'bg-blue-100 border-blue-300';
      case 'picked_up': return 'bg-purple-100 border-purple-300';
      case 'assigned': return 'bg-indigo-100 border-indigo-300';
      case 'ready_for_pickup': return 'bg-orange-100 border-orange-300';
      case 'preparing': return 'bg-yellow-100 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeRemaining = () => {
    if (!estimatedDeliveryTime) return null;
    
    const now = new Date();
    const diff = estimatedDeliveryTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Arriving now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    }
    return `${seconds}s remaining`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {formatTime(new Date(order.createdAt))}
                </p>
              </div>
              <span className="text-lg font-semibold text-red-600">₹{order.totalAmount || order.amount || 0}</span>
            </div>
            
            {estimatedDeliveryTime && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated delivery: {formatTime(estimatedDeliveryTime)}</span>
                {getTimeRemaining() && (
                  <span className="text-red-600 font-medium">({getTimeRemaining()})</span>
                )}
              </div>
            )}
          </div>

          {/* Delivery Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
              <span className="text-sm text-gray-500">{deliveryProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${deliveryProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Delivery Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h3>
            <div className="space-y-4">
              {deliverySteps.map((step, index) => {
                const isCompleted = index <= getCurrentStepIndex();
                const isActive = step.status === currentStatus;
                const isUpcoming = index > getCurrentStepIndex();

                return (
                  <div
                    key={step.status}
                    className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                      isActive ? getStatusBgColor(step.status, true) : 
                      isCompleted ? getStatusBgColor(step.status) : 
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive ? 'border-red-500 bg-red-100' :
                      isCompleted ? 'border-green-500 bg-green-100' :
                      'border-gray-300 bg-gray-100'
                    }`}>
                      <div className={getStatusColor(step.status, isActive)}>
                        {step.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isActive ? 'text-red-900' :
                        isCompleted ? 'text-green-900' :
                        'text-gray-500'
                      }`}>
                        {step.description}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatTime(step.timestamp)}
                      </p>
                    </div>

                    {isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-600 font-medium">Live</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Partner Info */}
          {deliveryBoy && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Your Delivery Partner
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">{deliveryBoy.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-blue-700">
                      <span className="flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        {deliveryBoy.vehicleDetails?.type} - {deliveryBoy.vehicleDetails?.number}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {deliveryBoy.rating} ⭐
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Tracking */}
          {deliveryBoy && (currentStatus === 'picked_up' || currentStatus === 'on_way') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
              
              {showMap && (
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                    <p>Google Maps integration would be here</p>
                    <p className="text-sm">Showing real-time delivery partner location</p>
                    {deliveryBoy.currentLocation && (
                      <p className="text-xs mt-2">
                        Current: {deliveryBoy.currentLocation.latitude.toFixed(4)}, {deliveryBoy.currentLocation.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Special Instructions
              </h3>
              <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Close
            </button>
            
            {currentStatus === 'delivered' && (
              <button className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-colors">
                Rate & Review
              </button>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Contact customer support: +91 1800-123-4567</p>
              <p>• Email: support@tabuloo.com</p>
              <p>• Live chat available 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
