import React, { useState } from 'react';
import paymentService from '../services/paymentService';

const TestPayment: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testPayment = async () => {
    setIsLoading(true);
    
    try {
      const testOrderData = {
        total: 100, // ₹1
        customerName: 'Test User',
        customerPhone: '+919876543210',
        address: 'Test Address',
        items: [{ name: 'Test Item', price: 100 }]
      };

      const testUser = {
        name: 'Test User',
        email: 'test@tabuloo.com'
      };

      await paymentService.initializePayment(
        testOrderData,
        testUser,
        (response: any) => {
          console.log('Payment Success:', response);
          alert('Payment successful! Check console for details.');
        },
        (error: any) => {
          console.error('Payment Error:', error);
          alert(`Payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Test payment error:', error);
      alert(`Test payment error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Test Payment</h3>
      <button
        onClick={testPayment}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Test ₹1 Payment'}
      </button>
      <p className="text-sm text-gray-600 mt-2">
        This will test the Razorpay integration with a ₹1 payment.
      </p>
    </div>
  );
};

export default TestPayment; 