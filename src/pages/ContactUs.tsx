import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-800 hover:text-red-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">We'd love to hear from you. Get in touch with us!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-700">support@tabuloo.com</p>
                    <p className="text-gray-700">business@tabuloo.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-700">+91 91009 33477</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-700">
                      Tabuloo Technologies Pvt. Ltd.<br />
                      6-237-98-79, Devalam Extation<br />
                      Madanapalle, Madanapalle<br />
                      Chittoor- 517325<br />
                      Andhra Pradesh, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-700">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-700">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-700">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How Can We Help?</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Customer Support</h3>
                  <p className="text-gray-700 text-sm">For order issues, refunds, and general inquiries</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Restaurant Partnerships</h3>
                  <p className="text-gray-700 text-sm">For restaurants interested in partnering with us</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Technical Support</h3>
                  <p className="text-gray-700 text-sm">For app issues, bugs, and technical problems</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Business Inquiries</h3>
                  <p className="text-gray-700 text-sm">For partnerships, investments, and business opportunities</p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Quick Help</h3>
              <p className="mb-4">Find answers to common questions in our FAQ section.</p>
              <button
                onClick={() => navigate('/faq')}
                className="bg-white text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                View FAQ
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Customer Support</option>
                  <option value="partnership">Restaurant Partnership</option>
                  <option value="technical">Technical Issue</option>
                  <option value="business">Business Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-6 rounded-lg font-medium hover:from-red-900 hover:to-red-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
              </svg>
            </a>
            <a href="#" className="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 