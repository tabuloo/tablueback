import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartIconProps {
  className?: string;
  showCount?: boolean;
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '', showCount = true, onClick }) => {
  const { itemCount } = useCart();

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <ShoppingCart className="h-5 w-5" />
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon; 