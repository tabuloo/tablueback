import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'restaurant_owner' | 'public_user';
  restaurantId?: string;
  walletBalance?: number;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any, role: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateWalletBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user data on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        // First check Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('Firebase user found:', firebaseUser.uid);
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userObj: User = {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || 'User',
                email: userData.email || firebaseUser.email || undefined,
                phone: userData.phone,
                role: userData.role || 'public_user',
                restaurantId: userData.restaurantId,
                walletBalance: userData.walletBalance || 0
              };
              setUser(userObj);
              // Store in localStorage for persistence
              localStorage.setItem('currentUser', JSON.stringify(userObj));
              console.log('User set from Firebase Auth:', userObj);
            }
          } else {
            console.log('No Firebase user, checking localStorage...');
            // Check localStorage for custom auth users (restaurant owners, public users, admin)
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                console.log('Found stored user:', userData);
                // Verify user still exists in Firestore
                const userDoc = await getDoc(doc(db, 'users', userData.id));
                if (userDoc.exists()) {
                  setUser(userData);
                  console.log('User restored from localStorage:', userData);
                } else {
                  // User no longer exists, clear storage
                  console.log('User no longer exists in Firestore, clearing storage');
                  localStorage.removeItem('currentUser');
                  setUser(null);
                }
              } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
                setUser(null);
              }
            } else {
              console.log('No stored user found');
              setUser(null);
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Utility function to check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  const login = async (credentials: any, role: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Admin login with hardcoded credentials
      if (role === 'admin') {
        if (
          (credentials.username === 'admin@tabuloo.com' || credentials.username === '9985121257') &&
          credentials.password === 'Admin@123'
        ) {
          // Create admin user in Firestore if doesn't exist
          const adminDoc = await getDoc(doc(db, 'users', 'admin_001'));
          if (!adminDoc.exists()) {
            await setDoc(doc(db, 'users', 'admin_001'), {
              name: 'Admin',
              email: 'admin@tabuloo.com',
              phone: '9985121257',
              role: 'admin',
              createdAt: new Date()
            });
          }
          
          const adminUser: User = {
            id: 'admin_001',
            name: 'Admin',
            email: 'admin@tabuloo.com',
            phone: '9985121257',
            role: 'admin'
          };
          
          setUser(adminUser);
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          console.log('Admin user logged in:', adminUser);
          setLoading(false);
          return true;
        }
      }
      
      // Restaurant owner login
      if (role === 'restaurant_owner') {
        try {
          // Find restaurant with matching credentials
          const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
          let matchingRestaurant: any = null;
          
          restaurantsSnapshot.forEach((doc) => {
            const restaurant = doc.data();
            if (restaurant.ownerCredentials && 
                restaurant.ownerCredentials.username === credentials.username && 
                restaurant.ownerCredentials.password === credentials.password) {
              matchingRestaurant = { id: doc.id, ...restaurant };
            }
          });
          
          if (matchingRestaurant) {
            // Create or update restaurant owner user
            const ownerId = `owner_${matchingRestaurant.id}`;
            const ownerData = {
              name: `${matchingRestaurant.name} Owner`,
              email: matchingRestaurant.ownerCredentials.username,
              role: 'restaurant_owner',
              restaurantId: matchingRestaurant.id,
              createdAt: new Date()
            };
            
            try {
              await setDoc(doc(db, 'users', ownerId), ownerData);
            } catch (error) {
              console.log('User creation error (continuing anyway):', error);
            }
            
            const ownerUser: User = {
              id: ownerId,
              name: ownerData.name,
              email: ownerData.email,
              role: 'restaurant_owner',
              restaurantId: matchingRestaurant.id
            };
            
            setUser(ownerUser);
            localStorage.setItem('currentUser', JSON.stringify(ownerUser));
            console.log('Restaurant owner logged in:', ownerUser);
            
            setLoading(false);
            return true;
          } else {
            toast.error('Invalid restaurant owner credentials');
            setLoading(false);
            return false;
          }
        } catch (error) {
          console.error('Restaurant owner login error:', error);
          toast.error('Login failed. Please try again.');
          setLoading(false);
          return false;
        }
      }
      
      // Public user login (phone-based)
      if (role === 'public_user') {
        try {
          if (!credentials.phone || !credentials.password) {
            toast.error('Phone number and password are required');
            setLoading(false);
            return false;
          }

          const userId = `user_${credentials.phone.replace(/\D/g, '')}`;
          
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Validate password
              if (userData.password !== credentials.password) {
                toast.error('Invalid phone number or password');
                setLoading(false);
                return false;
              }
              
              const publicUser: User = {
                id: userId,
                name: userData.name,
                phone: userData.phone,
                role: 'public_user',
                walletBalance: userData.walletBalance || 0
              };
              
              setUser(publicUser);
              localStorage.setItem('currentUser', JSON.stringify(publicUser));
              console.log('Public user logged in:', publicUser);
            } else {
              toast.error('Invalid phone number or password');
              setLoading(false);
              return false;
            }
            
            setLoading(false);
            return true;
          } catch (error) {
            console.error('Error accessing user document:', error);
            toast.error('Login failed. Please try again.');
            setLoading(false);
            return false;
          }
        } catch (error) {
          console.error('Public user login error:', error);
          toast.error('Login failed. Please try again.');
          setLoading(false);
          return false;
        }
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!userData.phone || !userData.name || !userData.password) {
        toast.error('Name, phone number, and password are required');
        setLoading(false);
        return false;
      }

      const userId = `user_${userData.phone.replace(/\D/g, '')}`;
      
      // Check if user already exists
      const existingUserDoc = await getDoc(doc(db, 'users', userId));
      if (existingUserDoc.exists()) {
        toast.error('User with this phone number already exists');
        setLoading(false);
        return false;
      }
      
      const newUser = {
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        role: 'public_user',
        walletBalance: 500.00,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', userId), newUser);
      
      const publicUser: User = {
        id: userId,
        name: newUser.name,
        phone: newUser.phone,
        role: 'public_user',
        walletBalance: newUser.walletBalance
      };
      
      setUser(publicUser);
      localStorage.setItem('currentUser', JSON.stringify(publicUser));
      console.log('New user registered:', publicUser);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user:', user);
      if (auth.currentUser) {
        await signOut(auth);
      }
      // Clear all stored user data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('restaurantOwnerSession');
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateWalletBalance = async (newBalance: number) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          walletBalance: newBalance
        });
        
        const updatedUser = { ...user, walletBalance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating wallet balance:', error);
        toast.error('Failed to update wallet balance');
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateWalletBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};