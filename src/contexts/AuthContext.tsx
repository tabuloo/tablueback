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
  role: 'admin' | 'restaurant_owner' | 'public_user' | 'delivery_boy';
  restaurantId?: string;
  walletBalance?: number;
  // Restaurant owner specific fields
  canChangePassword?: boolean;
  // Delivery boy specific fields
  isOnline?: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  vehicleDetails?: {
    type: 'bike' | 'scooter' | 'car' | 'bicycle';
    number: string;
    model?: string;
  };
  // New delivery boy fields
  profilePhoto?: File | null;
  panCardPhoto?: File | null;
  aadhaarCardPhoto?: File | null;
  bankDetails?: {
    method: 'bank' | 'upi';
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  earnings?: {
    total: number;
    thisMonth: number;
    thisWeek: number;
  };
}

 interface AuthContextType {
  user: User | null;
  login: (credentials: any, role: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updateWalletBalance: (newBalance: number) => void;
  resetWalletBalanceToZero: () => Promise<boolean>;
  changeRestaurantOwnerPassword: (newPassword: string) => Promise<boolean>;

  sendDeliveryLoginOTP: (phoneNumber: string) => Promise<boolean>;
  isDefaultUsername: (username: string) => boolean;
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

  // Retry mechanism for Firebase operations
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  };

  // Check for stored user data on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.log('Auth initialization timeout, falling back to localStorage');
          setLoading(false);
          // Fallback to localStorage if Firebase takes too long
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('User restored from localStorage after timeout:', userData);
            } catch (error) {
              console.error('Error parsing stored user after timeout:', error);
              localStorage.removeItem('currentUser');
            }
          }
        }, 10000); // 10 second timeout

        // First check Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            clearTimeout(timeoutId); // Clear timeout if Firebase responds
            
            if (firebaseUser) {
              console.log('Firebase user found:', firebaseUser.uid);
              // Get user data from Firestore with retry
              const userDoc = await retryOperation(() => getDoc(doc(db, 'users', firebaseUser.uid)));
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
                  // Verify user still exists in Firestore with retry
                  const userDoc = await retryOperation(() => getDoc(doc(db, 'users', userData.id)));
                  if (userDoc.exists()) {
                    const firestoreData = userDoc.data();
                    
                    // For public users, ensure wallet balance is 0 and update both Firestore and localStorage
                    if (userData.role === 'public_user') {
                      if (firestoreData.walletBalance !== 0) {
                        // Update Firestore to set wallet balance to 0 with retry
                        await retryOperation(() => updateDoc(doc(db, 'users', userData.id), {
                          walletBalance: 0
                        }));
                        console.log('Updated wallet balance to 0 in Firestore for existing user');
                      }
                      
                      // Update local user data to have 0 wallet balance
                      const updatedUserData = {
                        ...userData,
                        walletBalance: 0
                      };
                      
                      // Update localStorage
                      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
                      
                      setUser(updatedUserData);
                      console.log('User restored from localStorage with 0 wallet balance:', updatedUserData);
                    } else {
                      setUser(userData);
                      console.log('User restored from localStorage:', userData);
                    }
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
          } catch (error) {
            console.error('Error in Firebase auth state change:', error);
            clearTimeout(timeoutId);
            setLoading(false);
            // Fallback to localStorage on error
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                console.log('User restored from localStorage after error:', userData);
              } catch (parseError) {
                console.error('Error parsing stored user after error:', parseError);
                localStorage.removeItem('currentUser');
              }
            }
          }
        });

        return () => {
          clearTimeout(timeoutId);
          unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        // Fallback to localStorage on initialization error
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('User restored from localStorage after init error:', userData);
          } catch (parseError) {
            console.error('Error parsing stored user after init error:', parseError);
            localStorage.removeItem('currentUser');
          }
        }
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
      // Admin login with password verification
      if (role === 'admin') {
        // Only allow specific admin credentials
        const allowedAdminCredentials = [
          '9985121257',
          'tablooofficial1@gmail.com'
        ];
        
        // For demo purposes, use a simple password
        const expectedPassword = 'admin123'; // Simple admin password for demo
        
        if (
          allowedAdminCredentials.includes(credentials.username) &&
          credentials.password === expectedPassword
        ) {
          // Create admin user in Firestore if doesn't exist
          const adminDoc = await getDoc(doc(db, 'users', 'admin_001'));
          if (!adminDoc.exists()) {
            await setDoc(doc(db, 'users', 'admin_001'), {
              name: 'Admin',
              email: 'tablooofficial1@gmail.com',
              phone: '9985121257',
              role: 'admin',
              createdAt: new Date()
            });
          }
          
          const adminUser: User = {
            id: 'admin_001',
            name: 'Admin',
            email: 'tablooofficial1@gmail.com',
            phone: '9985121257',
            role: 'admin'
          };
          
          setUser(adminUser);
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          console.log('Admin user logged in:', adminUser);
          setLoading(false);
          return true;
        } else {
          toast.error('Invalid admin credentials. Only authorized users can access admin panel.');
          setLoading(false);
          return false;
        }
      }
      
      // Restaurant owner login with username and password verification
      if (role === 'restaurant_owner') {
        try {
          if (!credentials.username || !credentials.password) {
            toast.error('Username and password are required');
            setLoading(false);
            return false;
          }
          
          // Find restaurant with matching username and password
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
              canChangePassword: true,
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
              restaurantId: matchingRestaurant.id,
              canChangePassword: true
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
      
      // Public user login (phone-based with OTP)
      if (role === 'public_user') {
        try {
          if (!credentials.phone || !credentials.otp) {
            toast.error('Phone number and OTP are required');
            setLoading(false);
            return false;
          }

          const userId = `user_${credentials.phone.replace(/\D/g, '')}`;
          
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // OTP is already validated in the LoginForm component
              // Here we just proceed with login
              
              // Update user's wallet balance to 0 in database
              await updateDoc(doc(db, 'users', userId), {
                walletBalance: 0
              });
              
              const publicUser: User = {
                id: userId,
                name: userData.name,
                phone: userData.phone,
                role: 'public_user',
                walletBalance: 0 // Always start with 0 wallet balance
              };
              
              setUser(publicUser);
              localStorage.setItem('currentUser', JSON.stringify(publicUser));
              console.log('Public user logged in:', publicUser);
            } else {
              // If user doesn't exist, create a new user with the phone number
              const newUser = {
                name: `User_${credentials.phone.slice(-4)}`, // Generate a default name
                phone: credentials.phone,
                role: 'public_user',
                walletBalance: 0.00, // Initial wallet balance starts at 0
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
              console.log('New public user created and logged in:', publicUser);
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
      
      // Delivery boy login with password or OTP verification
      if (role === 'delivery_boy') {
        try {
          if (!credentials.phone) {
            toast.error('Phone number is required');
            setLoading(false);
            return false;
          }

          // Check if using password or OTP
          if (credentials.password && !credentials.otp) {
            // Password-based login
            if (!credentials.password) {
              toast.error('Password is required');
              setLoading(false);
              return false;
            }

            const userId = `delivery_${credentials.phone.replace(/\D/g, '')}`;
            
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Verify password
                if (userData.password !== credentials.password) {
                  toast.error('Invalid password');
                  setLoading(false);
                  return false;
                }
                
                const deliveryBoyUser: User = {
                  id: userId,
                  name: userData.name,
                  phone: userData.phone,
                  role: 'delivery_boy',
                  isOnline: userData.isOnline || false,
                  currentLocation: userData.currentLocation,
                  vehicleDetails: userData.vehicleDetails,
                  earnings: userData.earnings || { total: 0, thisMonth: 0, thisWeek: 0 }
                };
                
                setUser(deliveryBoyUser);
                localStorage.setItem('currentUser', JSON.stringify(deliveryBoyUser));
                console.log('Delivery boy logged in with password:', deliveryBoyUser);
                
                setLoading(false);
                return true;
              } else {
                toast.error('Delivery partner not found. Please register first.');
                setLoading(false);
                return false;
              }
            } catch (error) {
              console.error('Error accessing delivery boy document:', error);
              toast.error('Login failed. Please try again.');
              setLoading(false);
              return false;
            }
          } else if (credentials.otp && !credentials.password) {
            // OTP-based login
            if (!credentials.otp) {
              toast.error('OTP is required');
              setLoading(false);
              return false;
            }

            // Verify OTP
            const storedOTP = localStorage.getItem(`delivery_login_otp_${credentials.phone}`);
            if (storedOTP !== credentials.otp) {
              toast.error('Invalid OTP. Please try again.');
              setLoading(false);
              return false;
            }

            // Find delivery boy by phone number
            const userId = `delivery_${credentials.phone.replace(/\D/g, '')}`;
            
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                const deliveryBoyUser: User = {
                  id: userId,
                  name: userData.name,
                  phone: userData.phone,
                  role: 'delivery_boy',
                  isOnline: userData.isOnline || false,
                  currentLocation: userData.currentLocation,
                  vehicleDetails: userData.vehicleDetails,
                  earnings: userData.earnings || { total: 0, thisMonth: 0, thisWeek: 0 }
                };
                
                setUser(deliveryBoyUser);
                localStorage.setItem('currentUser', JSON.stringify(deliveryBoyUser));
                
                // Clear the OTP after successful login
                localStorage.removeItem(`delivery_login_otp_${credentials.phone}`);
                
                console.log('Delivery boy logged in with OTP:', deliveryBoyUser);
                
                setLoading(false);
                return true;
              } else {
                toast.error('Delivery partner not found. Please register first.');
                setLoading(false);
                return false;
              }
            } catch (error) {
              console.error('Error accessing delivery boy document:', error);
              toast.error('Login failed. Please try again.');
              setLoading(false);
              return false;
            }
          } else {
            toast.error('Please provide either password or OTP for login');
            setLoading(false);
            return false;
          }
        } catch (error) {
          console.error('Delivery boy login error:', error);
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
      // Handle delivery boy registration differently
      if (userData.role === 'delivery_boy') {
        if (!userData.phone || !userData.name || !userData.password) {
          toast.error('Name, phone number, and password are required');
          setLoading(false);
          return false;
        }

        const userId = `delivery_${userData.phone.replace(/\D/g, '')}`;
        
        // Check if delivery boy already exists
        const existingUserDoc = await getDoc(doc(db, 'users', userId));
        if (existingUserDoc.exists()) {
          toast.error('Delivery partner with this phone number already exists');
          setLoading(false);
          return false;
        }

        // Create delivery boy user
        const deliveryBoyData = {
          id: userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password, // In production, this should be hashed
          role: 'delivery_boy',
          vehicleDetails: userData.vehicleDetails,
          address: userData.address,
          idProof: userData.idProof,
          emergencyContact: userData.emergencyContact,
          // New fields
          profilePhoto: userData.profilePhoto,
          panCardPhoto: userData.panCardPhoto,
          aadhaarCardPhoto: userData.aadhaarCardPhoto,
          bankDetails: userData.bankDetails,
          isOnline: false,
          earnings: userData.earnings || { total: 0, thisMonth: 0, thisWeek: 0 },
          createdAt: new Date()
        };

        try {
          await setDoc(doc(db, 'users', userId), deliveryBoyData);
          toast.success('Delivery partner registration successful! You can now login.');
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error creating delivery boy:', error);
          toast.error('Registration failed. Please try again.');
          setLoading(false);
          return false;
        }
      }

      // Handle public user registration (existing logic)
      if (!userData.phone || !userData.name || !userData.otp) {
        toast.error('Name, phone number, and OTP are required');
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
      
      // OTP is already validated in the RegisterForm component
      // Here we just proceed with user creation
      
      const newUser = {
        name: userData.name,
        phone: userData.phone,
        role: 'public_user',
        walletBalance: 0.00, // Initial wallet balance starts at 0
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

   const resetWalletBalanceToZero = async () => {
     if (user && user.role === 'public_user') {
       try {
         await updateDoc(doc(db, 'users', user.id), {
           walletBalance: 0
         });
         
         const updatedUser = { ...user, walletBalance: 0 };
         setUser(updatedUser);
         localStorage.setItem('currentUser', JSON.stringify(updatedUser));
         
         console.log('Wallet balance reset to 0 for user:', user.id);
         return true;
       } catch (error) {
         console.error('Error resetting wallet balance:', error);
         toast.error('Failed to reset wallet balance');
         return false;
       }
     }
     return false;
   };

   const changeRestaurantOwnerPassword = async (newPassword: string): Promise<boolean> => {
    if (!user || user.role !== 'restaurant_owner' || !user.restaurantId) {
      toast.error('Only restaurant owners can change passwords');
      return false;
    }

    try {
      // Update the restaurant's owner password in Firestore
      const restaurantRef = doc(db, 'restaurants', user.restaurantId);
      await updateDoc(restaurantRef, {
        'ownerCredentials.password': newPassword
      });

      toast.success('Password changed successfully!');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.');
      return false;
    }
  };



    // Delivery boy login OTP function
  const sendDeliveryLoginOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll simulate sending OTP
      // In production, this should integrate with actual SMS service
      console.log(`Sending login OTP to phone: ${phoneNumber}`);
      
      // Store OTP in localStorage for demo (in production, this should be server-side)
      const demoOTP = '123456';
      localStorage.setItem(`delivery_login_otp_${phoneNumber}`, demoOTP);
      
      toast.success('OTP sent to your registered mobile number');
      return true;
    } catch (error) {
      console.error('Error sending delivery login OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
      return false;
    }
  };

  // Update user profile function
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) {
      toast.error('No user logged in');
      return false;
    }

    try {
      // Update user data in Firestore
      await updateDoc(doc(db, 'users', user.id), userData);
      
      // Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    }
  };

  // Check if username is a default generated name
  const isDefaultUsername = (username: string): boolean => {
    // Check for patterns like "User_1234", "User_5678", etc.
    const defaultUsernamePattern = /^User_\d{4}$/;
    return defaultUsernamePattern.test(username);
  };

        const value: AuthContextType = {
      user,
      login,
      register,
      logout,
      loading,
      updateUser,
      updateWalletBalance,
      resetWalletBalanceToZero,
      changeRestaurantOwnerPassword,
      
      sendDeliveryLoginOTP,
      isDefaultUsername
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};