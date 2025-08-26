import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavItem = {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const items: NavItem[] = [
    { key: 'home', label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { key: 'explore', label: 'Explore', path: '/event-planning', icon: <Search className="h-5 w-5" /> },
    { key: 'cart', label: 'Cart', path: '/cart', icon: <ShoppingCart className="h-5 w-5" /> },
    { key: 'profile', label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
  ];

  // Logout is shown inside Profile page, not in bottom nav.

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="w-full">
        <div className="bg-red-800 pb-safe">
          <ul className="grid grid-cols-4 py-2">
            {items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.key}>
                  <button
                    aria-label={item.label}
                    className={`flex flex-col items-center justify-center w-full py-1.5 text-xs transition-colors ${
                      active ? 'text-white' : 'text-white/90'
                    }`}
                    onClick={() => {
                      const requiresAuth = item.key === 'cart' || item.key === 'profile';
                      if (requiresAuth && !user) {
                        navigate('/auth');
                      } else {
                        navigate(item.path);
                      }
                    }}
                  >
                    <span className={`mb-0.5 ${active ? '' : ''}`}>{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;


