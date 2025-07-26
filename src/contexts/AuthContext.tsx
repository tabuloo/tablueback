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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            name: userData.name || firebaseUser.displayName || 'User',
            email: userData.email || firebaseUser.email || undefined,
            phone: userData.phone,
            role: userData.role || 'public_user',
            restaurantId: userData.restaurantId,
            walletBalance: userData.walletBalance || 0
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          
          setUser({
            id: 'admin_001',
            name: 'Admin',
            email: 'admin@tabuloo.com',
            phone: '9985121257',
            role: 'admin'
          });
          setLoading(false);
          return true;
        }
      }
      
      // Restaurant owner login
      if (role === 'restaurant_owner') {
        try {
          // Find restaurant with matching credentials
          const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
          let matchingRestaurant = null;
          
          restaurantsSnapshot.forEach((doc) => {
            const restaurant = doc.data();
            if (restaurant.ownerCredentials && 
                restaurant.ownerCredentials.username === credentials.username && 
                restaurant.ownerCredentials.password === credentials.password) {
              matchingRestaurant = { id: doc.id, ...restaurant };
            }
          });
          
          // Also sign in to Firebase Auth for proper authentication
          try {
            // Create a custom token or use a workaround for restaurant owners
            // For now, we'll set a flag to indicate this is a restaurant owner session
            localStorage.setItem('restaurantOwnerSession', JSON.stringify({
              userId: ownerId,
              restaurantId: matchingRestaurant.id
            }));
          } catch (authError) {
            console.log('Firebase Auth setup for restaurant owner:', authError);
          }
          
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
            
            setUser({
              id: ownerId,
              name: ownerData.name,
              email: ownerData.email,
              role: 'restaurant_owner',
              restaurantId: matchingRestaurant.id
            });
            
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
              
              setUser({
                id: userId,
                name: userData.name,
                phone: userData.phone,
                role: 'public_user',
                walletBalance: userData.walletBalance || 0
              });
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
      
      setUser({
        id: userId,
        name: newUser.name,
        phone: newUser.phone,
        role: 'public_user',
        walletBalance: newUser.walletBalance
      });
      
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
      if (auth.currentUser) {
        await signOut(auth);
      }
      // Clear restaurant owner session
      localStorage.removeItem('restaurantOwnerSession');
      setUser(null);
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
        
        setUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
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