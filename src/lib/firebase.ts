import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSsPQ3Rzr3e7beF5CTZlM1BDEbG5Bef7o",
  authDomain: "tabloo-17e7f.firebaseapp.com",
  projectId: "tabloo-17e7f",
  storageBucket: "tabloo-17e7f.firebasestorage.app",
  messagingSenderId: "662845885349",
  appId: "1:662845885349:web:7b9595f55cd3bd0841b64c",
  measurementId: "G-DXSSMD7DS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to local storage for better auth state management
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export default app;