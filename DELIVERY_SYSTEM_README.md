# Tabuloo Delivery System

A comprehensive delivery management system integrated into the Tabuloo restaurant platform, featuring real-time order tracking, automated delivery boy assignment, and a complete delivery partner portal.

## 🚀 Features

### **Delivery Boy Portal**
- **Role-based Authentication**: Dedicated login/registration for delivery partners
- **Real-time Dashboard**: Live order management and status updates
- **Location Tracking**: GPS-based location sharing and updates
- **Earnings Dashboard**: Track daily, weekly, and monthly earnings
- **Online/Offline Toggle**: Control availability status
- **Order Status Management**: Mark orders as picked up, on way, delivered

### **Order Assignment System**
- **Automatic Assignment**: AI-powered nearest delivery boy assignment
- **Manual Assignment**: Admin override for specific assignments
- **Smart Routing**: Distance-based optimization
- **Real-time Availability**: Live status of all delivery partners

### **Customer Order Tracking**
- **Live Status Updates**: Real-time order progress tracking
- **Delivery Timeline**: Visual progress bar with timestamps
- **Live Map Integration**: Real-time delivery partner location
- **ETA Updates**: Dynamic estimated delivery time
- **Status Notifications**: Push notifications for status changes

### **Admin Management**
- **Order Assignment Control**: Manual order assignment capabilities
- **Delivery Partner Management**: Monitor all delivery personnel
- **Performance Analytics**: Track delivery metrics and efficiency
- **Real-time Monitoring**: Live dashboard for all active deliveries

## 🏗️ Architecture

### **Frontend Components**
```
src/
├── pages/
│   └── DeliveryBoyDashboard.tsx      # Main delivery partner interface
├── components/
│   ├── auth/
│   │   └── DeliveryBoyAuthModal.tsx  # Delivery partner authentication
│   ├── admin/
│   │   └── OrderAssignmentModal.tsx  # Admin order assignment interface
│   └── customer/
│       └── OrderTrackingModal.tsx    # Customer order tracking interface
└── contexts/
    └── AuthContext.tsx               # Updated with delivery boy role
```

### **Data Models**

#### **Delivery Boy Profile**
```typescript
interface DeliveryBoy {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'delivery_boy';
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  vehicleDetails: {
    type: 'bike' | 'scooter' | 'car' | 'bicycle';
    number: string;
    model?: string;
  };
  earnings: {
    total: number;
    thisMonth: number;
    thisWeek: number;
  };
  idProof: {
    type: string;
    number: string;
  };
  emergencyContact: {
    phone: string;
    relation: string;
  };
}
```

#### **Order Status Flow**
```
pending → confirmed → preparing → ready_for_pickup → assigned → picked_up → on_way → delivered
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ 
- React 18+
- TypeScript
- Firebase (for backend)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd tablueback
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

### **Accessing the System**

#### **Delivery Boy Portal**
- Navigate to the main page
- Click "Delivery" button in the header
- Register/Login as a delivery partner
- Access the dedicated delivery dashboard

#### **Admin Order Assignment**
- Login as admin user
- Access order management section
- Use "Assign Order" functionality
- Choose between automatic or manual assignment

#### **Customer Tracking**
- Place an order through the platform
- Access order tracking via order confirmation
- View real-time delivery status and location

## 🔧 Configuration

### **Environment Variables**
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# Google Maps API (for live tracking)
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Push Notification Service
REACT_APP_PUSH_NOTIFICATION_KEY=your_notification_key
```

### **Firebase Rules**
```javascript
// Firestore security rules for delivery system
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Delivery boys can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Orders can be read by customers and delivery boys
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.deliveryBoyId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         resource.data.deliveryBoyId == request.auth.uid);
    }
  }
}
```

## 📱 Usage Examples

### **Delivery Boy Workflow**

1. **Login & Go Online**
   ```typescript
   // Delivery boy logs in and toggles online status
   const toggleOnlineStatus = () => {
     setIsOnline(!isOnline);
     // Update Firestore with online status
   };
   ```

2. **Accept Orders**
   ```typescript
   // System automatically assigns nearby orders
   const assignedOrders = orders.filter(order => 
     order.status === 'assigned' && 
     order.deliveryBoyId === user.id
   );
   ```

3. **Update Order Status**
   ```typescript
   const updateOrderStatus = (orderId: string, newStatus: string) => {
     // Update order status in Firestore
     // Trigger customer notifications
     // Update earnings calculation
   };
   ```

### **Admin Order Assignment**

1. **Automatic Assignment**
   ```typescript
   const autoAssignOrder = async (orderId: string) => {
     const nearestDeliveryBoy = await findNearestDeliveryBoy(order.location);
     await assignOrderToDeliveryBoy(orderId, nearestDeliveryBoy.id);
   };
   ```

2. **Manual Assignment**
   ```typescript
   const manualAssignOrder = async (orderId: string, deliveryBoyId: string) => {
     await assignOrderToDeliveryBoy(orderId, deliveryBoyId);
     // Send notification to delivery boy
   };
   ```

## 🔒 Security Features

- **Role-based Access Control**: Strict permission management
- **Data Validation**: Input sanitization and validation
- **Secure Authentication**: Firebase Auth integration
- **Location Privacy**: Optional location sharing controls
- **Audit Logging**: Track all order assignments and status changes

## 📊 Performance Features

- **Real-time Updates**: Live status synchronization
- **Location Optimization**: Efficient delivery route calculation
- **Push Notifications**: Instant status change alerts
- **Offline Support**: Graceful degradation when network unavailable
- **Caching**: Local storage for frequently accessed data

## 🚧 Future Enhancements

### **Phase 2 Features**
- **Route Optimization**: Google Directions API integration
- **Advanced Analytics**: Delivery performance metrics
- **Multi-language Support**: Localization for delivery partners
- **Payment Integration**: In-app payment for delivery fees
- **Rating System**: Customer feedback and ratings

### **Phase 3 Features**
- **AI-powered Assignment**: Machine learning for optimal delivery boy selection
- **Predictive Analytics**: ETA prediction using historical data
- **Bulk Order Management**: Handle multiple orders simultaneously
- **Advanced Reporting**: Comprehensive delivery analytics dashboard
- **Mobile App**: Native mobile applications for delivery partners

## 🐛 Troubleshooting

### **Common Issues**

1. **Location Not Updating**
   - Check browser permissions for location access
   - Verify GPS is enabled on device
   - Check network connectivity

2. **Orders Not Assigning**
   - Verify delivery boys are online
   - Check admin permissions
   - Review Firebase rules

3. **Real-time Updates Not Working**
   - Check Firebase connection
   - Verify WebSocket connections
   - Review network firewall settings

### **Debug Mode**
```typescript
// Enable debug logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Delivery System Debug:', {
    currentUser: user,
    assignedOrders,
    deliveryBoys: availableDeliveryBoys
  });
}
```

## 📞 Support

For technical support or feature requests:

- **Email**: tech-support@tabuloo.com
- **Documentation**: [API Documentation](link-to-docs)
- **Issue Tracker**: [GitHub Issues](link-to-issues)
- **Community**: [Tabuloo Community Forum](link-to-forum)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development Setup
- Pull Request Process
- Testing Guidelines
- Code Style Standards

---

**Built with ❤️ by the Tabuloo Team**
