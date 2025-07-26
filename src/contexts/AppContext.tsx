import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Restaurant {
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
  createdAt?: Date;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  category: 'veg' | 'non-veg';
  name: string;
  itemCategory: string;
  quantity: string;
  price: number;
  image: string;
  available: boolean;
  createdAt?: Date;
}

interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: MenuItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed';
  type: 'delivery' | 'pickup';
  total: number;
  address?: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  paymentMethod?: 'wallet' | 'netbanking' | 'card' | 'upi' | 'cod';
}

interface Booking {
  id: string;
  userId: string;
  restaurantId: string;
  type: 'table' | 'event';
  date: string;
  time: string;
  customers: number;
  customerNames: string[];
  phone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  amount: number;
  createdAt: Date;
  specialRequests?: string;
  foodOptions?: string;
  occasion?: string;
  placeForEvent?: string;
  description?: string;
  paymentMethod?: 'wallet' | 'netbanking' | 'card' | 'upi' | 'cod';
}

interface AppContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  bookings: Booking[];
  loading: boolean;
  addRestaurant: (restaurant: Omit<Restaurant, 'id'>) => Promise<void>;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  updateMenuItem: (menuItem: MenuItem) => Promise<void>;
  updateRestaurantStatus: (restaurantId: string, isOpen: boolean) => Promise<void>;
  updateMenuItemAvailability: (itemId: string, available: boolean) => Promise<void>;
  deleteRestaurant: (restaurantId: string) => Promise<void>;
  deleteMenuItem: (menuItemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listeners for Firestore collections
  useEffect(() => {
    const unsubscribeRestaurants = onSnapshot(
      collection(db, 'restaurants'),
      (snapshot) => {
        const restaurantData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        setRestaurants(restaurantData);
      },
      (error) => {
        console.error('Error fetching restaurants:', error);
        toast.error('Failed to load restaurants');
      }
    );

    const unsubscribeMenuItems = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const menuData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(menuData);
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu items');
      }
    );

    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const orderData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Order[];
        setOrders(orderData);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    );

    const unsubscribeBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const bookingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Booking[];
        setBookings(bookingData);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      }
    );

    setLoading(false);

    return () => {
      unsubscribeRestaurants();
      unsubscribeMenuItems();
      unsubscribeOrders();
      unsubscribeBookings();
    };
  }, []);

  const addRestaurant = async (restaurant: Omit<Restaurant, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'restaurants'), {
        ...restaurant,
        createdAt: new Date()
      });
      console.log('Restaurant added with ID:', docRef.id);
      toast.success('Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast.error(`Failed to add restaurant: ${error.message}`);
      throw error;
    }
  };

  const addMenuItem = async (menuItem: Omit<MenuItem, 'id'>) => {
    try {
      console.log('Adding menu item:', menuItem);
      const docRef = await addDoc(collection(db, 'menuItems'), {
        ...menuItem,
        createdAt: new Date()
      });
      console.log('Menu item added with ID:', docRef.id);
      toast.success('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error(`Failed to add menu item: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: new Date()
      });
      console.log('Order added with ID:', docRef.id);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error(`Failed to place order: ${error.message}`);
      throw error;
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: new Date()
      });
      console.log('Booking added with ID:', docRef.id);
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error adding booking:', error);
      toast.error(`Failed to confirm booking: ${error.message}`);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success('Order status updated!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      throw error;
    }
  };

  const updateRestaurant = async (restaurant: Restaurant) => {
    try {
      const { id, ...updateData } = restaurant;
      await updateDoc(doc(db, 'restaurants', id), updateData);
      toast.success('Restaurant updated successfully!');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant');
      throw error;
    }
  };

  const updateMenuItem = async (menuItem: MenuItem) => {
    try {
      const { id, ...updateData } = menuItem;
      await updateDoc(doc(db, 'menuItems', id), updateData);
      toast.success('Menu item updated successfully!');
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
      throw error;
    }
  };

  const updateRestaurantStatus = async (restaurantId: string, isOpen: boolean) => {
    try {
      console.log('Updating restaurant status:', { restaurantId, isOpen, userId: auth.currentUser?.uid });
      await updateDoc(doc(db, 'restaurants', restaurantId), { isOpen });
      toast.success(`Restaurant ${isOpen ? 'opened' : 'closed'}!`);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      toast.error(`Failed to update restaurant status: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const updateMenuItemAvailability = async (itemId: string, available: boolean) => {
    try {
      console.log('Updating menu item availability:', { itemId, available, userId: auth.currentUser?.uid });
      await updateDoc(doc(db, 'menuItems', itemId), { available });
      toast.success(`Menu item ${available ? 'made available' : 'made unavailable'}!`);
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      toast.error(`Failed to update menu item availability: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const deleteRestaurant = async (restaurantId: string) => {
    try {
      // Delete restaurant
      await deleteDoc(doc(db, 'restaurants', restaurantId));
      
      // Delete associated menu items
      const menuQuery = query(collection(db, 'menuItems'), where('restaurantId', '==', restaurantId));
      const menuSnapshot = await getDocs(menuQuery);
      const deleteMenuPromises = menuSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteMenuPromises);
      
      // Delete associated orders
      const orderQuery = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));
      const orderSnapshot = await getDocs(orderQuery);
      const deleteOrderPromises = orderSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteOrderPromises);
      
      // Delete associated bookings
      const bookingQuery = query(collection(db, 'bookings'), where('restaurantId', '==', restaurantId));
      const bookingSnapshot = await getDocs(bookingQuery);
      const deleteBookingPromises = bookingSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteBookingPromises);
      
      toast.success('Restaurant and all associated data deleted successfully!');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
      throw error;
    }
  };

  const deleteMenuItem = async (menuItemId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', menuItemId));
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
      throw error;
    }
  };

  const value: AppContextType = {
    restaurants,
    menuItems,
    orders,
    bookings,
    loading,
    addRestaurant,
    addMenuItem,
    addOrder,
    addBooking,
    updateOrderStatus,
    updateRestaurant,
    updateMenuItem,
    updateRestaurantStatus,
    updateMenuItemAvailability,
    deleteRestaurant,
    deleteMenuItem
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};