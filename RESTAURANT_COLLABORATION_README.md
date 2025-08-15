# Restaurant Collaboration System

## Overview
This system allows Tabuloo administrators to collaborate with restaurants and hotels by creating owner accounts for them. Restaurant owners can then manage their menus and operations through the platform.

## How It Works

### 1. Admin Process
- **Admin Login**: Admins log in using `9985121257` or `tablooofficial1@gmail.com` with password `admin123`
- **Restaurant Addition**: Admins can add new restaurants/hotels/resorts through the dashboard
- **Owner Account Creation**: When adding a restaurant, admins create username and password for the restaurant owner
- **Account Management**: Admins can edit restaurant details and owner credentials

### 2. Restaurant Owner Process
- **Login**: Restaurant owners log in using the username and password created by admin
- **Dashboard Access**: Once logged in, they can access their restaurant dashboard
- **Menu Management**: Add, edit, and remove menu items
- **Password Change**: Restaurant owners can change their login password
- **Restaurant Status**: Control whether their restaurant is open or closed

### 3. Authentication Flow

#### Admin Authentication
- Uses username/password authentication
- Fixed credentials for demo purposes: `9985121257` or `tablooofficial1@gmail.com` with password `admin123`
- Full access to restaurant management

#### Restaurant Owner Authentication
- Username/password authentication
- Credentials created by admin
- Access only to their own restaurant

#### Public User Authentication
- Phone number + OTP authentication
- Can order food and book tables

#### Delivery Boy Authentication
- Phone number + password authentication OR Phone number + OTP authentication
- Aadhaar verification required during registration (12-digit validation + OTP verification)
- Enhanced validation: 10-digit phone numbers, 6-digit pincodes, unique emergency contacts
- Credentials created during registration
- Access to delivery dashboard and order management

## Features

### Admin Dashboard
- Add new restaurants with owner accounts
- Edit restaurant details and owner credentials
- Delete restaurants (removes all associated data)
- View all partner restaurants
- Monitor restaurant status

### Restaurant Owner Dashboard
- **Orders Tab**: View and manage food orders
- **Bookings Tab**: Manage table and event bookings
- **Menu Tab**: Comprehensive menu management system
  - Add new menu items with detailed information
  - Edit existing menu items
  - Remove menu items
  - Toggle item availability (available/unavailable)
  - Visual indicators for item status
  - Menu statistics dashboard
  - Categorization by food type (veg/non-veg) and item category
- **Settings Tab**: View restaurant details and change password

### Menu Management
- **Add Menu Items**: 
  - Food type selection (Vegetarian/Non-Vegetarian)
  - Item category selection (pastry, ice cream, tiffin, biryani, etc.)
  - Item name, quantity/size, and price
  - Optional image URL for better presentation
  - Form validation with helpful hints
- **Edit Menu Items**: Modify all item details
- **Delete Menu Items**: Remove items with confirmation
- **Availability Toggle**: 
  - Easy toggle button for each menu item
  - Visual indicators (available = green, unavailable = red)
  - Unavailable items show as grayed out with "Unavailable" badge
  - Affects customer ordering (unavailable items won't be orderable)
- **Menu Statistics**: 
  - Total items count
  - Available vs unavailable items
  - Vegetarian vs non-vegetarian count

### Delivery Boy Features
- **Dual Authentication**: Password-based or OTP-based login
- **Aadhaar Verification**: Required 12-digit validation with OTP verification
- **Enhanced Validation**: 
  - 10-digit phone number validation
  - 6-digit pincode validation
  - Unique emergency contact (different from primary phone)
  - Vehicle information validation
- **Comprehensive Registration**: 
  - Personal details and contact information
  - Vehicle details (type, number, model)
  - Address information (full address, city, pincode)
  - Identity verification with multiple ID proof options
  - Emergency contact details

## Database Structure

### Restaurants Collection
```typescript
{
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'resort';
  address: string;
  capacity: number;
  crowdCapacity: number;
  images: string[];
  price: number;
  ownerCredentials: {
    username: string;
    password: string;
  };
  isOpen: boolean;
  timings: string;
  createdAt: Date;
}
```

### Menu Items Collection
```typescript
{
  id: string;
  restaurantId: string;
  category: 'veg' | 'non-veg';
  name: string;
  itemCategory: string;
  quantity: string;
  price: number;
  image: string;
  available: boolean;
  createdAt: Date;
}
```

### Users Collection
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'restaurant_owner' | 'public_user' | 'delivery_boy';
  restaurantId?: string;
  walletBalance?: number;
  canChangePassword?: boolean;
  createdAt: Date;
}
```

## Security Features

### Password Management
- Restaurant owners can change their passwords
- Current password verification required
- Minimum 6 character requirement
- Password visibility toggle

### Access Control
- Restaurant owners only see their own restaurant data
- Admins have full access to all restaurants
- Public users can only view and order

## Usage Instructions

### For Admins
1. Login with admin credentials
2. Click "Add Restaurant & Create Owner Account"
3. Fill in restaurant details
4. Create username and password for owner
5. Submit to create restaurant and owner account

### For Restaurant Owners
1. Login with credentials provided by admin
2. Navigate to Menu tab to manage items
3. Use Settings tab to change password
4. Monitor orders and bookings

### For Public Users
1. Login with phone number and OTP
2. Browse restaurants and menus
3. Place orders and make bookings

## Demo Credentials

### Admin
- Username: `9985121257` or `tablooofficial1@gmail.com`
- Password: `admin123`

### Restaurant Owner (after creation)
- Username: Created by admin
- Password: Created by admin

### Public User
- Phone: Any valid Indian phone number
- OTP: `123456` (demo OTP)

### Delivery Boy
- Phone: Any valid Indian phone number
- Password: Created during registration

## Technical Implementation

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Context API for state management
- Real-time updates with Firestore

### Backend
- Firebase Firestore for database
- Firebase Authentication (optional)
- Real-time listeners for live updates

### Key Components
- `AdminDashboard`: Restaurant and owner management
- `RestaurantOwnerDashboard`: Restaurant operations
- `AuthContext`: Authentication and user management
- `AppContext`: Restaurant and menu data management

## Future Enhancements

1. **Enhanced Security**: Implement proper password hashing
2. **Email Verification**: Add email verification for restaurant owners
3. **Analytics**: Add sales and performance analytics
4. **Payment Integration**: Direct payment processing
5. **Mobile App**: Native mobile applications
6. **API**: RESTful API for third-party integrations

## Support

For technical support or questions about the restaurant collaboration system, please contact the development team or refer to the main project documentation.
