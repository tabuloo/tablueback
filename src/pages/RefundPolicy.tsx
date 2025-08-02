import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-600">Last Updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Tabuloo, we strive to provide excellent service and ensure customer satisfaction. This refund policy outlines the conditions under which refunds are available for our various services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Table Bookings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancellation Timeline</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>More than 2 hours before booking:</strong> 100% refund</li>
                  <li><strong>1-2 hours before booking:</strong> 50% refund</li>
                  <li><strong>Less than 1 hour before booking:</strong> No refund</li>
                  <li><strong>No-show:</strong> No refund</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant Cancellations</h3>
                <p className="text-gray-700">
                  If a restaurant cancels your booking due to unforeseen circumstances (closure, special events, etc.), you will receive a 100% refund or the option to reschedule.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Food Orders</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">General Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Food orders are generally non-refundable once accepted by the restaurant</li>
                  <li>Exceptions may apply for quality issues or incorrect orders</li>
                  <li>Pre-orders can be cancelled up to 30 minutes before pickup time</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Issues</h3>
                <p className="text-gray-700">
                  If you receive food that is clearly spoiled, contaminated, or significantly different from what was ordered, contact our support team within 2 hours of receiving the order. We will work with the restaurant to provide a refund or replacement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Wrong Orders</h3>
                <p className="text-gray-700">
                  If you receive the wrong order, contact us immediately. We will coordinate with the restaurant to provide the correct order or a full refund.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Event Bookings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancellation Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>More than 48 hours before event:</strong> 100% refund</li>
                  <li><strong>24-48 hours before event:</strong> 75% refund</li>
                  <li><strong>12-24 hours before event:</strong> 50% refund</li>
                  <li><strong>Less than 12 hours before event:</strong> No refund</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Special Events</h3>
                <p className="text-gray-700">
                  For special events, corporate bookings, or large group reservations, specific terms may apply. These will be clearly communicated at the time of booking.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Platform Fees</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Charges</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Platform fees are non-refundable unless the entire order is cancelled</li>
                  <li>Processing fees charged by payment gateways are non-refundable</li>
                  <li>In case of full refunds, platform fees will be refunded</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Refund Processing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Refunds are processed within 5-7 business days</li>
                  <li>Credit card refunds may take 7-10 business days to appear on your statement</li>
                  <li>UPI refunds are typically processed within 24-48 hours</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Refund Method</h3>
                <p className="text-gray-700">
                  Refunds will be processed through the same payment method used for the original transaction. If that method is no longer available, we will contact you to arrange an alternative refund method.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How to Request a Refund</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Contact our support team via email: support@tabuloo.com</li>
                  <li>Include your order/booking ID and reason for refund</li>
                  <li>Provide any relevant photos or documentation</li>
                  <li>We will review your request within 24 hours</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Appeals</h3>
                <p className="text-gray-700">
                  If your refund request is denied, you may appeal the decision by providing additional information or documentation. Our team will review your appeal within 48 hours.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Exceptions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Force Majeure</h3>
                <p className="text-gray-700">
                  In cases of natural disasters, government orders, or other force majeure events, refund policies may be adjusted. We will communicate any changes promptly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Goodwill Refunds</h3>
                <p className="text-gray-700">
                  Tabuloo may offer goodwill refunds or credits in special circumstances at our sole discretion, even when standard refund policies do not apply.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: support@tabuloo.com</p>
              <p>📞 Phone: [Customer Care Number]</p>
              <p>⏰ Support Hours: 9:00 AM - 9:00 PM (IST)</p>
              <p>📍 Address: [Your Registered Office Address]</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Note</h3>
            <p className="text-yellow-700">
              This refund policy is subject to change. Any updates will be posted on our platform with an updated effective date. Continued use of our services constitutes acceptance of the updated policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy; 