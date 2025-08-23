import React, { useState } from 'react';
import paymentService from '../services/paymentService';

const TestPayment: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testType, setTestType] = useState<'food' | 'table' | 'event'>('food');

  const testFoodPayment = async () => {
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
          console.log('Food Payment Success:', response);
          alert('Food payment successful! Check console for details.');
        },
        (error: any) => {
          console.error('Food Payment Error:', error);
          alert(`Food payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Test food payment error:', error);
      alert(`Test food payment error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTableBookingPayment = async () => {
    setIsLoading(true);
    
    try {
      const testBookingData = {
        amount: 50, // ₹0.50
        phone: '+919876543210',
        restaurantName: 'Test Restaurant',
        date: '2024-12-25',
        time: '19:00',
        customers: '2',
        customerNames: ['Test User 1', 'Test User 2'],
        customerPhones: ['+919876543210', '+919876543211'],
        specialRequests: 'Test special request',
        foodOptions: 'Test food options',
        selectedMenuItems: { 'item1': 2, 'item2': 1 }
      };

      const testUser = {
        name: 'Test User',
        email: 'test@tabuloo.com'
      };

      await paymentService.initializeTableBookingPayment(
        testBookingData,
        testUser,
        (response: any) => {
          console.log('Table Booking Payment Success:', response);
          alert('Table booking payment successful! Check console for details.');
        },
        (error: any) => {
          console.error('Table Booking Payment Error:', error);
          alert(`Table booking payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Test table booking payment error:', error);
      alert(`Test table booking payment error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEventBookingPayment = async () => {
    setIsLoading(true);
    
    try {
      const testBookingData = {
        amount: 100, // ₹1
        phone: '+919876543210',
        venueName: 'Test Venue',
        occasion: 'Test Event',
        date: '2024-12-25',
        time: '18:00',
        attendees: '10',
        customerNames: ['Test User 1', 'Test User 2', 'Test User 3'],
        customerPhones: ['+919876543210', '+919876543211', '+919876543212'],
        placeForEvent: 'Main Hall',
        description: 'Test event description',
        specialRequests: 'Test special requests'
      };

      const testUser = {
        name: 'Test User',
        email: 'test@tabuloo.com'
      };

      await paymentService.initializeEventBookingPayment(
        testBookingData,
        testUser,
        (response: any) => {
          console.log('Event Booking Payment Success:', response);
          alert('Event booking payment successful! Check console for details.');
        },
        (error: any) => {
          console.error('Event Booking Payment Error:', error);
          alert(`Event booking payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Test event booking payment error:', error);
      alert(`Test event booking payment error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = () => {
    switch (testType) {
      case 'food':
        testFoodPayment();
        break;
      case 'table':
        testTableBookingPayment();
        break;
      case 'event':
        testEventBookingPayment();
        break;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Test Payment Gateway</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Test Type:
        </label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value as 'food' | 'table' | 'event')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="food">Food Order Payment</option>
          <option value="table">Table Booking Payment</option>
          <option value="event">Event Management Payment</option>
        </select>
      </div>

      <button
        onClick={runTest}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : `Test ${testType === 'food' ? '₹1' : testType === 'table' ? '₹0.50' : '₹1'} Payment`}
      </button>
      
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p><strong>Food Order:</strong> Tests the standard food ordering payment flow</p>
        <p><strong>Table Booking:</strong> Tests table booking with menu selection payment</p>
        <p><strong>Event Management:</strong> Tests event booking and management payment</p>
        <p className="text-xs text-gray-500 mt-2">
          All tests use the Razorpay integration with minimal amounts for testing purposes.
        </p>
      </div>
    </div>
  );
};

export default TestPayment; 