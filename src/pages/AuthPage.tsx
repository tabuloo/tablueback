import React, { useState } from 'react';
import { MapPin, Shield, Store, Users } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'restaurant_owner' | 'public_user'>('public_user');
  const [showRegister, setShowRegister] = useState(false);

  const roles = [
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'Manage restaurants and platform',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      id: 'restaurant_owner' as const,
      title: 'Restaurant Owner',
      description: 'Manage your restaurant',
      icon: Store,
      color: 'bg-green-500'
    },
    {
      id: 'public_user' as const,
      title: 'Customer',
      description: 'Book tables and order food',
      icon: Users,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto text-white">
            <div className="flex items-center mb-8">
              <MapPin className="h-12 w-12 text-white" />
              <span className="ml-3 text-4xl font-bold">Tabuloo</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              Your Gateway to Amazing Dining Experiences
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              Connect restaurants, owners, and customers in one seamless platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Book tables instantly</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Order food for delivery or pickup</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Organize events seamlessly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication */}
        <div className="lg:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Role Selection */}
            {!showRegister && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Select Role</h3>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRole === role.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${role.color} mr-3`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900">{role.title}</h4>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Authentication Forms */}
            {showRegister && selectedRole === 'public_user' ? (
              <RegisterForm 
                onSwitchToLogin={() => setShowRegister(false)} 
                onRegisterSuccess={() => {
                  // The AuthPage doesn't need to close anything since it will redirect
                  // The redirect happens automatically via the App component when user state changes
                }}
              />
            ) : (
              <LoginForm 
                role={selectedRole} 
                onSwitchToRegister={selectedRole === 'public_user' ? () => setShowRegister(true) : undefined}
                onLoginSuccess={() => {
                  // The AuthPage doesn't need to close anything since it will redirect
                  // The redirect happens automatically via the App component when user state changes
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;