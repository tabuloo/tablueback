import React from 'react';
import { ArrowLeft, Truck, Clock, MapPin, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShippingPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-800 hover:text-red-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping & Delivery Policy</h1>
          <p className="text-gray-600">Last Updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Tabuloo, we understand the importance of timely delivery and excellent service. 
              This shipping and delivery policy outlines our delivery standards, timeframes, and 
              service areas for both food delivery and table reservations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Food Delivery Service</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Areas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Primary Service Areas</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Madanapalle City</li>
                      <li>• Devalam Extation</li>
                      <li>• Chittoor City</li>
                      <li>• Palamaner</li>
                      <li>• Punganur</li>
                      <li>• Thamballapalle</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Extended Areas</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Tirupati</li>
                      <li>• Puttur</li>
                      <li>• Vayalpad</li>
                      <li>• Kuppam</li>
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">* Additional delivery fee may apply</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Timeframes</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-800">Standard Delivery</h4>
                    <p className="text-sm text-blue-700">30-45 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-800">Express Delivery</h4>
                    <p className="text-sm text-green-700">20-30 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-purple-800">Scheduled Delivery</h4>
                    <p className="text-sm text-purple-700">Pre-booked time</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Charges</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Distance</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Standard Fee</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Express Fee</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Free Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      <tr>
                        <td className="px-4 py-2 border-b">0-3 km</td>
                        <td className="px-4 py-2 border-b">₹30</td>
                        <td className="px-4 py-2 border-b">₹50</td>
                        <td className="px-4 py-2 border-b">Orders above ₹200</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">3-5 km</td>
                        <td className="px-4 py-2 border-b">₹50</td>
                        <td className="px-4 py-2 border-b">₹70</td>
                        <td className="px-4 py-2 border-b">Orders above ₹300</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">5-8 km</td>
                        <td className="px-4 py-2 border-b">₹70</td>
                        <td className="px-4 py-2 border-b">₹90</td>
                        <td className="px-4 py-2 border-b">Orders above ₹500</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">8+ km</td>
                        <td className="px-4 py-2 border-b">₹100</td>
                        <td className="px-4 py-2 border-b">₹120</td>
                        <td className="px-4 py-2 border-b">Not available</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Table Reservation Service</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Reservation Timeframes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Advance Booking</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Up to 30 days in advance</li>
                      <li>• Preferred for special occasions</li>
                      <li>• Guaranteed table availability</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Same Day Booking</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Available up to 2 hours before</li>
                      <li>• Subject to availability</li>
                      <li>• Real-time table status</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Reservation Policies</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Table Holding</h4>
                      <p className="text-sm text-gray-700">Your table will be held for 15 minutes beyond your scheduled time.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Group Bookings</h4>
                      <p className="text-sm text-gray-700">Special arrangements available for groups of 8+ people with advance notice.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">No-Show Policy</h4>
                      <p className="text-sm text-gray-700">Repeated no-shows may result in booking restrictions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Delivery Standards</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Food Safety & Packaging</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Temperature Control</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Hot food maintained at 60°C+</li>
                      <li>• Cold items kept at 4°C or below</li>
                      <li>• Insulated delivery bags</li>
                      <li>• Temperature monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Packaging Standards</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Tamper-evident packaging</li>
                      <li>• Leak-proof containers</li>
                      <li>• Eco-friendly materials</li>
                      <li>• Proper labeling</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Partner Standards</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Safety Protocols</h4>
                      <p className="text-sm text-gray-700">All delivery partners follow strict hygiene and safety protocols.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Real-time Tracking</h4>
                      <p className="text-sm text-gray-700">Track your order in real-time through our app.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Contactless Delivery</h4>
                      <p className="text-sm text-gray-700">Contactless delivery option available for all orders.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Service Hours</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Food Delivery</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-gray-700">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Saturday - Sunday</span>
                    <span className="text-gray-700">9:00 AM - 12:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Public Holidays</span>
                    <span className="text-gray-700">10:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Table Reservations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Advance Booking</span>
                    <span className="text-gray-700">24/7 Online</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Same Day Booking</span>
                    <span className="text-gray-700">Until 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Customer Support</span>
                    <span className="text-gray-700">9:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Delivery Issues & Support</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Common Issues</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Late Delivery</h4>
                    <p className="text-sm text-red-700">If your order is delayed by more than 15 minutes, contact us immediately for compensation.</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Wrong Order</h4>
                    <p className="text-sm text-yellow-700">Report incorrect items within 30 minutes of delivery for immediate replacement.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    For delivery-related issues, contact our support team:
                  </p>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>📧 Email: delivery@tabuloo.com</p>
                    <p>📞 Phone: +91 91009 33477</p>
                    <p>⏰ Support Hours: 9:00 AM - 9:00 PM (IST)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Delivery times may vary during peak hours and adverse weather conditions</li>
              <li>• Some restaurants may have different delivery areas and timeframes</li>
              <li>• Table reservations are subject to restaurant availability</li>
              <li>• We reserve the right to modify delivery areas and charges based on operational requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy; 