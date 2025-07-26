import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantOwnerDashboard from './pages/RestaurantOwnerDashboard';
import UserProfile from './pages/UserProfile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route 
          path="/" 
          element={
            user?.role === 'public_user' ? (
              <HomePage />
            ) : user?.role === 'admin' ? (
              <AdminDashboard />
            ) : user?.role === 'restaurant_owner' ? (
              <RestaurantOwnerDashboard />
            ) : (
              <HomePage />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            user && user.role === 'public_user' ? (
              <UserProfile />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;