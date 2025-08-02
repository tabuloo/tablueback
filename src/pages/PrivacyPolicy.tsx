import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Effective Date: December 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Tabuloo. We value your privacy and are committed to protecting your personal data. 
              This Privacy Policy describes how Tabuloo collects, uses, shares, and protects information about 
              users of our mobile application and website ("Platform").
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect the following types of data:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">a. Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name</li>
                  <li>Phone number</li>
                  <li>Email address</li>
                  <li>Date of birth (optional)</li>
                  <li>Location (only with permission)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">b. Transactional & Booking Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Orders placed</li>
                  <li>Table booking details</li>
                  <li>Pickup time and location</li>
                  <li>Event registrations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">c. Device & Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address</li>
                  <li>Device type</li>
                  <li>App usage behavior</li>
                  <li>Cookies and log files</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">d. Payment Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Partial card/UPI information (processed securely by payment gateways like Razorpay)</li>
                  <li>Transaction history</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Note: We do not store your full card or UPI credentials.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              Your data is used strictly to improve your experience and fulfill services. Specifically, we use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide order delivery, table reservations, and event booking services</li>
              <li>Communicate offers, confirmations, and alerts</li>
              <li>Process payments securely</li>
              <li>Personalize recommendations and UX</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your data to any third parties. However, we may share your data with:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Entity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-b">Restaurant Partners</td>
                    <td className="px-4 py-2 border-b">To fulfill your orders and reservations</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Payment Gateways</td>
                    <td className="px-4 py-2 border-b">For secure payment processing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">SMS/Email Providers</td>
                    <td className="px-4 py-2 border-b">To send notifications or updates</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Legal Authorities</td>
                    <td className="px-4 py-2 border-b">Only when required by law (e.g., fraud investigation)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Withdraw consent for marketing</li>
              <li>Request account deletion (by contacting: support@tabuloo.com)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-700 mb-4">
              We may use cookies, device identifiers, and tracking tools to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Save login sessions</li>
              <li>Analyze user behavior to improve performance</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookie settings in your browser/app permissions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
            <p className="text-gray-700 mb-4">We implement strict security measures:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>SSL encryption</li>
              <li>Two-factor authentication (for merchants/admins)</li>
              <li>Secure API communication</li>
              <li>Limited internal access to sensitive data</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no system is 100% secure. You use the Platform at your own risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Tabuloo is not intended for use by persons under the age of 13. We do not knowingly collect data from minors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date. 
              Continued use of the app after changes implies your agreement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this policy or your data, contact us at:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: support@tabuloo.com</p>
              <p>📍 Address: [Your Registered Office Address]</p>
              <p>📞 Phone: [Customer Care Number]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 