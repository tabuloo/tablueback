import React from 'react';
import { ArrowLeft, Users, Target, Award, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About Tabuloo</h1>
          <p className="text-gray-600">Revolutionizing the dining experience</p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-lg p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              To connect food lovers with exceptional dining experiences through innovative technology, 
              making every meal memorable and every reservation seamless.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Our Story */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2024, Tabuloo emerged from a simple observation: dining out should be effortless and enjoyable. 
              We noticed that despite the digital age, booking tables, ordering food, and coordinating group events 
              remained fragmented and often frustrating experiences.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our team of food enthusiasts and technology experts came together to create a comprehensive platform 
              that streamlines every aspect of the dining journey. From individual table bookings to large event 
              coordination, Tabuloo serves as the bridge between diners and restaurants, ensuring both parties 
              have the best possible experience.
            </p>
          </div>

          {/* What We Do */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Table Reservations</h3>
                <p className="text-gray-700">
                  Instant table booking at partner restaurants with real-time availability and flexible scheduling options.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Food Ordering</h3>
                <p className="text-gray-700">
                  Pre-order meals for pickup or dine-in, with customizable options and dietary preferences.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Management</h3>
                <p className="text-gray-700">
                  Coordinate group dining experiences, corporate events, and special celebrations with ease.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Dining</h3>
                <p className="text-gray-700">
                  Connect with friends, plan group outings, and share dining experiences seamlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community First</h3>
                <p className="text-gray-700">
                  We believe in building strong relationships between diners, restaurants, and our platform.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-red-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-700">
                  Continuously improving our technology to provide the best possible user experience.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality</h3>
                <p className="text-gray-700">
                  Partnering only with restaurants that meet our high standards for food and service.
                </p>
              </div>
            </div>
          </div>

          {/* Our Impact */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Impact</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Diners</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Seamless booking experience</li>
                  <li>• Time-saving pre-ordering</li>
                  <li>• Better dining coordination</li>
                  <li>• Access to exclusive offers</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Restaurants</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Increased table utilization</li>
                  <li>• Reduced no-shows</li>
                  <li>• Better customer insights</li>
                  <li>• Streamlined operations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Technology</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tabuloo leverages cutting-edge technology to provide a seamless dining experience:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Real-time Integration</h4>
                <p className="text-gray-700 text-sm">
                  Live synchronization with restaurant systems for accurate availability and instant confirmations.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h4>
                <p className="text-gray-700 text-sm">
                  AI-powered suggestions based on your preferences, location, and dining history.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Secure Payments</h4>
                <p className="text-gray-700 text-sm">
                  Multiple payment options with bank-grade security and fraud protection.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Mobile-First Design</h4>
                <p className="text-gray-700 text-sm">
                  Optimized for mobile devices with intuitive navigation and fast loading times.
                </p>
              </div>
            </div>
          </div>

          {/* Future Vision */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We envision a world where dining out is always effortless, enjoyable, and memorable. 
              Our goal is to become the go-to platform for all dining-related activities, from casual 
              meals to grand celebrations.
            </p>
            <div className="flex items-center justify-center">
              <Globe className="h-8 w-8 text-red-800 mr-3" />
              <span className="text-gray-700 font-medium">
                Expanding across India and beyond, one table at a time.
              </span>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center bg-red-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get in Touch</h3>
            <p className="text-gray-700 mb-4">
              Have questions about Tabuloo? We'd love to hear from you!
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-3 rounded-lg hover:from-red-900 hover:to-red-950 transition-all font-medium"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 