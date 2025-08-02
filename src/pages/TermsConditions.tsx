import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Company Name: Tabuloo</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Tabuloo's mobile application or website ("Platform"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, please do not use the Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Services Provided</h2>
            <p className="text-gray-700 mb-4">Tabuloo offers:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Online food ordering and pickup</li>
              <li>Table reservations at partner restaurants</li>
              <li>Event booking and group dining coordination</li>
              <li>Pre-ordering and dine-in scheduling with friends</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We act as a facilitator between you and restaurants; we do not own or control the restaurants listed on our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You must be at least 13 years old to use Tabuloo.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You agree to provide accurate and updated information during registration and use.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Ordering & Payments</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Orders can be placed for dine-in, pickup, or future scheduling.</li>
              <li>All payments must be made through our integrated payment partners (e.g., Razorpay).</li>
              <li>Prices are shown inclusive of applicable taxes and platform fees.</li>
              <li>Restaurants are solely responsible for food preparation, quality, and service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cancellations & Refunds</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Table Booking: Cancellable up to 2 hours in advance (refund policy applies).</li>
              <li>Food Orders: Non-refundable once accepted by the restaurant.</li>
              <li>Events: Refunds depend on event type, partner policy, and timing.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Tabuloo may offer goodwill credits in special cases at its sole discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Abuse, harass, threaten, or impersonate others</li>
              <li>Interfere with app functionality or misuse the platform</li>
              <li>Attempt unauthorized access to systems or accounts</li>
              <li>Use Tabuloo for any unlawful purpose</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Violations may lead to account suspension or legal action.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>All content on Tabuloo (logos, branding, UI, etc.) is owned by or licensed to us.</li>
              <li>You may not reproduce, copy, or redistribute any part of the platform without permission.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Partner Restaurant Responsibilities</h2>
            <p className="text-gray-700 mb-4">Restaurants listed on Tabuloo are responsible for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Accuracy of menus, pricing, and availability</li>
              <li>Hygiene and FSSAI compliance</li>
              <li>Order fulfillment and customer service</li>
              <li>Complying with local and national laws</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">Tabuloo is not liable for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Food-related issues (allergies, delays, quality)</li>
              <li>Restaurant closures or operational failures</li>
              <li>External delivery services or third-party apps</li>
              <li>Any indirect, incidental, or consequential damages</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
            <p className="text-gray-700">
              We may revise these Terms from time to time. Updates will be posted on our platform with an effective date. Continued use of the app constitutes your acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700">
              Tabuloo reserves the right to suspend or terminate your access if you violate these Terms or engage in fraudulent or abusive activity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and interpreted under the laws of India, and any disputes will be subject to the jurisdiction of courts in Bangalore.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">For questions, complaints, or support:</p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: support@tabuloo.com</p>
              <p>📞 Phone: [Insert support number]</p>
              <p>📍 Office Address: [Insert registered office address]</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 font-medium">
              By using Tabuloo, you agree to all the terms outlined above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions; 