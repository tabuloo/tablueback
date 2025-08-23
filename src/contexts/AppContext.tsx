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

interface RestaurantRegistrationRequest {
  id: string;
  restaurantName: string;
  restaurantType: 'restaurant' | 'hotel' | 'resort';
  restaurantAddress: string;
  foodServingCapacity: number;
  crowdCapacity: number;
  restaurantImages: string[];
  averagePricePerPerson: number;
  operatingHours: string;
  ownerEmail: string;
  ownerPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: Date;
  adminResponseAt?: Date;
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  type: 'delivery' | 'pickup';
  total: number;
  address?: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  statusUpdatedAt?: Date;
  previousStatus?: Order['status'];
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
  customerPhones: string[];
  phone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  amount: number;
  createdAt: Date;
  statusUpdatedAt?: Date;
  previousStatus?: Booking['status'];
  specialRequests?: string;
  foodOptions?: string;
  occasion?: string;
  placeForEvent?: string;
  description?: string;
  paymentMethod?: 'wallet' | 'netbanking' | 'card' | 'upi' | 'cod' | 'razorpay';
  selectedMenuItems?: {[key: string]: number};
  paymentId?: string;
  orderId?: string;
}

// Event Planning Interfaces
interface EventRequirement {
  id: string;
  userId: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'parties' | 'others';
  eventDate: string;
  location: string;
  guestCount: number;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  notes: string;
  images: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  assignedManagerId?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

interface EventManager {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  categories: string[];
  experience: number;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  portfolio: {
    images: string[];
    videos?: string[];
    pastEvents: string[];
  };
  services: {
    name: string;
    description: string;
    price: number;
    duration: string;
  }[];
  availability: {
    dates: string[];
    timeSlots: string[];
  };
  pricing: {
    basePrice: number;
    packages: {
      name: string;
      description: string;
      price: number;
      features: string[];
    }[];
  };
  rating: number;
  reviews: number;
  verified: boolean;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventBooking {
  id: string;
  requirementId: string;
  managerId: string;
  customerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  amount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: 'razorpay' | 'stripe' | 'bank_transfer';
  advanceAmount?: number;
  finalAmount?: number;
  eventDate: string;
  eventLocation: string;
  specialRequests?: string;
  managerNotes?: string;
  customerRating?: number;
  customerReview?: string;
  createdAt: Date;
  updatedAt: Date;
  commissionAmount?: number;
  platformFee?: number;
}

interface EventChat {
  id: string;
  requirementId?: string;
  managerId: string;
  customerId: string;
  messages: {
    id: string;
    senderId: string;
    senderType: 'customer' | 'manager';
    message: string;
    timestamp: Date;
    read: boolean;
  }[];
  lastMessage?: {
    message: string;
    timestamp: Date;
    senderId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AppContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  bookings: Booking[];
  // Event Planning Data
  eventRequirements: EventRequirement[];
  eventManagers: EventManager[];
  eventBookings: EventBooking[];
  eventChats: EventChat[];
  loading: boolean;
  error: string | null;
  
  // Restaurant Functions
  addRestaurant: (restaurant: Omit<Restaurant, 'id'>) => Promise<void>;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  getOrderStatusHistory: (orderId: string) => Promise<{ status: Order['status']; timestamp: Date; updatedBy?: string }[]>;
  getBookingStatusHistory: (bookingId: string) => Promise<{ status: Booking['status']; timestamp: Date; updatedBy?: string }[]>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  updateMenuItem: (menuItem: MenuItem) => Promise<void>;
  updateRestaurantStatus: (restaurantId: string, isOpen: boolean) => Promise<void>;
  updateMenuItemAvailability: (itemId: string, available: boolean) => Promise<void>;
  deleteRestaurant: (restaurantId: string) => Promise<void>;
  deleteMenuItem: (menuItemId: string) => Promise<void>;
  submitRestaurantRegistration: (request: Omit<RestaurantRegistrationRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  
  // Event Planning Functions
  addEventRequirement: (requirement: Omit<EventRequirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addEventManager: (manager: Omit<EventManager, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addEventBooking: (booking: Omit<EventBooking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addEventChat: (chat: Omit<EventChat, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEventRequirement: (requirementId: string, updates: Partial<EventRequirement>) => Promise<void>;
  updateEventManager: (managerId: string, updates: Partial<EventManager>) => Promise<void>;
  updateEventBooking: (bookingId: string, updates: Partial<EventBooking>) => Promise<void>;
  updateEventChat: (chatId: string, updates: Partial<EventChat>) => Promise<void>;
  deleteEventRequirement: (requirementId: string) => Promise<void>;
  deleteEventManager: (managerId: string) => Promise<void>;
  deleteEventBooking: (bookingId: string) => Promise<void>;
  deleteEventChat: (chatId: string) => Promise<void>;
  approveEventManager: (managerId: string) => Promise<void>;
  rejectEventManager: (managerId: string, reason: string) => Promise<void>;
  sendMessage: (chatId: string, message: Omit<EventChat['messages'][0], 'id' | 'timestamp' | 'read'>) => Promise<void>;
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
  // Event Planning State
  const [eventRequirements, setEventRequirements] = useState<EventRequirement[]>([]);
  const [eventManagers, setEventManagers] = useState<EventManager[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [eventChats, setEventChats] = useState<EventChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listeners for Firestore collections
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('App initialization timed out. Please check your internet connection.');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    try {
      const unsubscribeRestaurants = onSnapshot(
        collection(db, 'restaurants'),
        (snapshot) => {
          try {
            const restaurantData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Restaurant[];
            setRestaurants(restaurantData);
          } catch (error) {
            console.error('Error processing restaurant data:', error);
          }
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
          // Don't show toast error to avoid blocking the app
        }
      );

      const unsubscribeMenuItems = onSnapshot(
        collection(db, 'menuItems'),
        (snapshot) => {
          try {
            const menuData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as MenuItem[];
            setMenuItems(menuData);
          } catch (error) {
            console.error('Error processing menu data:', error);
          }
        },
        (error) => {
          console.error('Error fetching menu items:', error);
          // Don't show toast error to avoid blocking the app
        }
      );

      const unsubscribeOrders = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          try {
            const orderData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Order[];
            setOrders(orderData);
          } catch (error) {
            console.error('Error processing order data:', error);
          }
        },
        (error) => {
          console.error('Error fetching orders:', error);
          // Don't show toast error to avoid blocking the app
        }
      );

      const unsubscribeBookings = onSnapshot(
        collection(db, 'bookings'),
        (snapshot) => {
          try {
            const bookingData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Booking[];
            setBookings(bookingData);
          } catch (error) {
            console.error('Error processing booking data:', error);
          }
        },
        (error) => {
          console.error('Error fetching bookings:', error);
          // Don't show toast error to avoid blocking the app
        }
      );

    // Event Planning Real-time Listeners
    const unsubscribeEventRequirements = onSnapshot(
      collection(db, 'eventRequirements'),
      (snapshot) => {
        try {
          const requirementData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as EventRequirement[];
          setEventRequirements(requirementData);
        } catch (error) {
          console.error('Error processing event requirement data:', error);
        }
      },
      (error) => {
        console.error('Error fetching event requirements:', error);
        // Don't show toast error to avoid blocking the app
      }
    );

    const unsubscribeEventManagers = onSnapshot(
      collection(db, 'eventManagers'),
      (snapshot) => {
        try {
          const managerData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as EventManager[];
          setEventManagers(managerData);
        } catch (error) {
          console.error('Error processing event manager data:', error);
        }
      },
      (error) => {
        console.error('Error fetching event managers:', error);
        // Don't show toast error to avoid blocking the app
      }
    );

    const unsubscribeEventBookings = onSnapshot(
      collection(db, 'eventBookings'),
      (snapshot) => {
        try {
          const bookingData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as EventBooking[];
          setEventBookings(bookingData);
        } catch (error) {
          console.error('Error processing event booking data:', error);
        }
      },
      (error) => {
        console.error('Error fetching event bookings:', error);
        // Don't show toast error to avoid blocking the app
      }
    );

    const unsubscribeEventChats = onSnapshot(
      collection(db, 'eventChats'),
      (snapshot) => {
        try {
          const chatData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as EventChat[];
          setEventChats(chatData);
        } catch (error) {
          console.error('Error processing event chat data:', error);
        }
      },
      (error) => {
        console.error('Error fetching event chats:', error);
        // Don't show toast error to avoid blocking the app
      }
    );

    setLoading(false);

    return () => {
      clearTimeout(timeoutId);
      unsubscribeRestaurants();
      unsubscribeMenuItems();
      unsubscribeOrders();
      unsubscribeBookings();
      unsubscribeEventRequirements();
      unsubscribeEventManagers();
      unsubscribeEventBookings();
      unsubscribeEventChats();
    };
  } catch (error) {
    console.error('Error setting up real-time listeners:', error);
    setError(error instanceof Error ? error.message : 'Failed to initialize app');
    setLoading(false);
  }
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
      toast.error('Failed to add restaurant');
      throw error;
    }
  };

  const addMenuItem = async (menuItem: Omit<MenuItem, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'menuItems'), {
        ...menuItem,
        createdAt: new Date()
      });
      console.log('Menu item added with ID:', docRef.id);
      toast.success('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log('Order added with ID:', docRef.id);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to place order');
      throw error;
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), booking);
      console.log('Booking added with ID:', docRef.id);
      toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Error adding booking:', error);
      toast.error('Failed to create booking');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Validate status transition
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transition logic
      const validTransitions: Record<Order['status'], Order['status'][]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['delivered', 'cancelled'],
        'delivered': ['completed'],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[order.status].includes(status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${status}`);
      }

      console.log('Updating order status:', { orderId, status, userId: auth.currentUser?.uid });
      
      await updateDoc(doc(db, 'orders', orderId), { 
        status,
        statusUpdatedAt: new Date(),
        previousStatus: order.status
      });
      
      toast.success(`Order status updated to ${status}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      // Validate status transition
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Validate status transition logic
      const validTransitions: Record<Booking['status'], Booking['status'][]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[booking.status].includes(status)) {
        throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
      }

      console.log('Updating booking status:', { bookingId, status, userId: auth.currentUser?.uid });
      
      await updateDoc(doc(db, 'bookings', bookingId), { 
        status,
        statusUpdatedAt: new Date(),
        previousStatus: booking.status
      });
      
      toast.success(`Booking status updated to ${status}!`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateRestaurant = async (restaurant: Restaurant) => {
    try {
      console.log('Updating restaurant:', { restaurantId: restaurant.id, userId: auth.currentUser?.uid });
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
      console.log('Updating menu item:', { menuItemId: menuItem.id, userId: auth.currentUser?.uid });
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
      toast.error(`Failed to update restaurant status: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      toast.error(`Failed to update menu item availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

    const getOrderStatusHistory = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const history = [];
      if (order.previousStatus) {
        history.push({
          status: order.previousStatus,
          timestamp: order.statusUpdatedAt || order.createdAt,
          updatedBy: 'restaurant_owner'
        });
      }
      
      history.push({
        status: order.status,
        timestamp: order.statusUpdatedAt || order.createdAt,
        updatedBy: 'restaurant_owner'
      });

      return history;
    } catch (error) {
      console.error('Error getting order status history:', error);
      throw error;
    }
  };

  const getBookingStatusHistory = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const history = [];
      if (booking.previousStatus) {
        history.push({
          status: booking.previousStatus,
          timestamp: booking.statusUpdatedAt || booking.createdAt,
          updatedBy: 'restaurant_owner'
        });
      }
      
      history.push({
        status: booking.status,
        timestamp: booking.statusUpdatedAt || booking.createdAt,
        updatedBy: 'restaurant_owner'
      });

      return history;
    } catch (error) {
      console.error('Error getting booking status history:', error);
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

  const submitRestaurantRegistration = async (request: Omit<RestaurantRegistrationRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      const registrationRequest: Omit<RestaurantRegistrationRequest, 'id'> = {
        ...request,
        status: 'pending',
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'restaurantRegistrationRequests'), registrationRequest);
      toast.success('Restaurant registration request submitted successfully! Please check your email for admin response within 24-48 hours.');
    } catch (error) {
      console.error('Error submitting restaurant registration:', error);
      toast.error('Failed to submit registration request');
      throw error;
    }
  };

  // Event Planning Functions
  const addEventRequirement = async (requirement: Omit<EventRequirement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'eventRequirements'), {
        ...requirement,
        createdAt: now,
        updatedAt: now
      });
      console.log('Event requirement added with ID:', docRef.id);
      toast.success('Event requirement posted successfully!');
    } catch (error) {
      console.error('Error adding event requirement:', error);
      toast.error('Failed to post event requirement');
      throw error;
    }
  };

  const addEventManager = async (manager: Omit<EventManager, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'eventManagers'), {
        ...manager,
        createdAt: now,
        updatedAt: now
      });
      console.log('Event manager added with ID:', docRef.id);
      toast.success('Event manager profile created successfully!');
    } catch (error) {
      console.error('Error adding event manager:', error);
      toast.error('Failed to create event manager profile');
      throw error;
    }
  };

  const addEventBooking = async (booking: Omit<EventBooking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'eventBookings'), {
        ...booking,
        createdAt: now,
        updatedAt: now
      });
      console.log('Event booking added with ID:', docRef.id);
      toast.success('Event booking created successfully!');
    } catch (error) {
      console.error('Error adding event booking:', error);
      toast.error('Failed to create event booking');
      throw error;
    }
  };

  const addEventChat = async (chat: Omit<EventChat, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'eventChats'), {
        ...chat,
        createdAt: now,
        updatedAt: now
      });
      console.log('Event chat added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding event chat:', error);
      toast.error('Failed to create chat');
      throw error;
    }
  };

  const updateEventRequirement = async (requirementId: string, updates: Partial<EventRequirement>) => {
    try {
      await updateDoc(doc(db, 'eventRequirements', requirementId), {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Event requirement updated successfully!');
    } catch (error) {
      console.error('Error updating event requirement:', error);
      toast.error('Failed to update event requirement');
      throw error;
    }
  };

  const updateEventManager = async (managerId: string, updates: Partial<EventManager>) => {
    try {
      await updateDoc(doc(db, 'eventManagers', managerId), {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Event manager profile updated successfully!');
    } catch (error) {
      console.error('Error updating event manager:', error);
      toast.error('Failed to update event manager profile');
      throw error;
    }
  };

  const updateEventBooking = async (bookingId: string, updates: Partial<EventBooking>) => {
    try {
      await updateDoc(doc(db, 'eventBookings', bookingId), {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Event booking updated successfully!');
    } catch (error) {
      console.error('Error updating event booking:', error);
      toast.error('Failed to update event booking');
      throw error;
    }
  };

  const updateEventChat = async (chatId: string, updates: Partial<EventChat>) => {
    try {
      await updateDoc(doc(db, 'eventChats', chatId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating event chat:', error);
      toast.error('Failed to update chat');
      throw error;
    }
  };

  const deleteEventRequirement = async (requirementId: string) => {
    try {
      await deleteDoc(doc(db, 'eventRequirements', requirementId));
      toast.success('Event requirement deleted successfully!');
    } catch (error) {
      console.error('Error deleting event requirement:', error);
      toast.error('Failed to delete event requirement');
      throw error;
    }
  };

  const deleteEventManager = async (managerId: string) => {
    try {
      await deleteDoc(doc(db, 'eventManagers', managerId));
      toast.success('Event manager profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting event manager:', error);
      toast.error('Failed to delete event manager profile');
      throw error;
    }
  };

  const deleteEventBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'eventBookings', bookingId));
      toast.success('Event booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting event booking:', error);
      toast.error('Failed to delete event booking');
      throw error;
    }
  };

  const deleteEventChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, 'eventChats', chatId));
    } catch (error) {
      console.error('Error deleting event chat:', error);
      toast.error('Failed to delete chat');
      throw error;
    }
  };

  const approveEventManager = async (managerId: string) => {
    try {
      await updateDoc(doc(db, 'eventManagers', managerId), {
        status: 'approved',
        updatedAt: new Date()
      });
      toast.success('Event manager approved successfully!');
    } catch (error) {
      console.error('Error approving event manager:', error);
      toast.error('Failed to approve event manager');
      throw error;
    }
  };

  const rejectEventManager = async (managerId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'eventManagers', managerId), {
        status: 'rejected',
        adminResponse: reason,
        updatedAt: new Date()
      });
      toast.success('Event manager rejected successfully!');
    } catch (error) {
      console.error('Error rejecting event manager:', error);
      toast.error('Failed to reject event manager');
      throw error;
    }
  };

  const sendMessage = async (chatId: string, message: Omit<EventChat['messages'][0], 'id' | 'timestamp' | 'read'>) => {
    try {
      const newMessage = {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false
      };

      const chatRef = doc(db, 'eventChats', chatId);
      const chatDoc = await getDocs(query(collection(db, 'eventChats'), where('id', '==', chatId)));
      
      if (!chatDoc.empty) {
        const chatData = chatDoc.docs[0].data() as EventChat;
        const updatedMessages = [...chatData.messages, newMessage];
        
        await updateDoc(chatRef, {
          messages: updatedMessages,
          lastMessage: {
            message: newMessage.message,
            timestamp: newMessage.timestamp,
            senderId: newMessage.senderId
          },
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  const value: AppContextType = {
    restaurants,
    menuItems,
    orders,
    bookings,
    // Event Planning Data
    eventRequirements,
    eventManagers,
    eventBookings,
    eventChats,
    loading,
    error,
    
    // Restaurant Functions
    addRestaurant,
    addMenuItem,
    addOrder,
    addBooking,
    updateOrderStatus,
    updateBookingStatus,
    getOrderStatusHistory,
    getBookingStatusHistory,
    updateRestaurant,
    updateMenuItem,
    updateRestaurantStatus,
    updateMenuItemAvailability,
    deleteRestaurant,
    deleteMenuItem,
    submitRestaurantRegistration,
    
    // Event Planning Functions
    addEventRequirement,
    addEventManager,
    addEventBooking,
    addEventChat,
    updateEventRequirement,
    updateEventManager,
    updateEventBooking,
    updateEventChat,
    deleteEventRequirement,
    deleteEventManager,
    deleteEventBooking,
    deleteEventChat,
    approveEventManager,
    rejectEventManager,
    sendMessage
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing app...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show a simple error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">App Initialization Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};