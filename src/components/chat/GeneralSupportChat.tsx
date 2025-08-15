import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, HelpCircle, ShoppingCart, Calendar, PartyPopper, ChefHat, MapPin, Phone, Mail } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface GeneralSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralSupportChat: React.FC<GeneralSupportChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm your Tabuloo Support Assistant. I can help you with anything related to our platform - from booking tables and ordering food to event planning and general inquiries. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // General platform questions
    if (input.includes('what is tabuloo') || input.includes('about tabuloo') || input.includes('platform')) {
      return "Tabuloo is your comprehensive dining and event planning platform! 🍽️✨\n\nWe offer:\n• Table reservations at top restaurants\n• Food delivery and pickup\n• Event planning and venue booking\n• Premium dining experiences\n• Multiple payment options\n\nWe connect food lovers with the best dining experiences!";
    }
    
    // Table booking help
    if (input.includes('table') || input.includes('reservation') || input.includes('book table')) {
      return "Table booking is super easy! 📅\n\nHere's how:\n1. Click 'Book Table' on any restaurant\n2. Choose your date and time\n3. Select number of guests\n4. Enter contact details\n5. Make advance payment (20%)\n6. Get instant confirmation\n\nNeed help with a specific booking?";
    }
    
    // Food ordering help
    if (input.includes('food') || input.includes('order') || input.includes('delivery') || input.includes('pickup')) {
      return "Food ordering made simple! 🍕\n\nOptions available:\n• Home delivery\n• Restaurant pickup\n• Express delivery\n• Scheduled orders\n\nProcess:\n1. Browse restaurant menus\n2. Add items to cart\n3. Choose delivery/pickup\n4. Enter address & payment\n5. Track your order\n\nWhat type of food are you looking for?";
    }
    
    // Event planning help
    if (input.includes('event') || input.includes('party') || input.includes('celebration')) {
      return "Event planning is our specialty! 🎉\n\nWe help with:\n• Birthday parties\n• Corporate events\n• Weddings & receptions\n• Anniversaries\n• Business meetings\n\nFeatures:\n• Venue selection\n• Capacity planning\n• Catering options\n• Decoration services\n• Payment plans\n\nWhat type of event are you planning?";
    }
    
    // Payment questions
    if (input.includes('payment') || input.includes('pay') || input.includes('money') || input.includes('₹') || input.includes('wallet')) {
      return "We offer multiple payment options! 💳\n\nPayment methods:\n• Tabuloo Wallet\n• Credit/Debit cards\n• UPI\n• Net banking\n• Cash on delivery/arrival\n\nFor bookings:\n• 20% advance payment required\n• Remaining on service day\n\nFor food orders:\n• Full payment upfront\n• Multiple payment options\n\nNeed help with a specific payment?";
    }
    
    // Restaurant questions
    if (input.includes('restaurant') || input.includes('venue') || input.includes('place') || input.includes('food place')) {
      return "We have amazing restaurants! 🏪\n\nRestaurant types:\n• Fine dining\n• Casual restaurants\n• Hotels & resorts\n• Cafes & bistros\n\nFeatures:\n• Real-time availability\n• Customer reviews\n• Photos & menus\n• Location & directions\n• Opening hours\n\nLooking for a specific cuisine or area?";
    }
    
    // Account & profile help
    if (input.includes('account') || input.includes('profile') || input.includes('login') || input.includes('sign up')) {
      return "Account management is simple! 👤\n\nFeatures:\n• Quick OTP-based login\n• Profile management\n• Order history\n• Booking history\n• Wallet management\n• Address book\n\nLogin options:\n• Public users (food ordering)\n• Restaurant owners\n• Admin users\n• Delivery partners\n\nNeed help with your account?";
    }
    
    // Contact & support
    if (input.includes('contact') || input.includes('support') || input.includes('help') || input.includes('phone') || input.includes('email')) {
      return "We're here to help! 📞\n\nContact options:\n• Phone: +91 9100933477\n• Email: support@tabuloo.com\n• Live chat (right here!)\n• In-app support\n\nSupport hours:\n• 24/7 online support\n• Phone: 9 AM - 9 PM\n• Emergency: Always available\n\nWhat specific help do you need?";
    }
    
    // Technical issues
    if (input.includes('problem') || input.includes('issue') || input.includes('error') || input.includes('not working') || input.includes('bug')) {
      return "Sorry to hear you're having issues! 🔧\n\nLet's troubleshoot:\n• What exactly isn't working?\n• Which page/feature?\n• What error message?\n• Browser/device details?\n\nQuick fixes:\n• Refresh the page\n• Clear browser cache\n• Check internet connection\n• Try different browser\n\nCan you describe the issue in detail?";
    }
    
    // Pricing & costs
    if (input.includes('price') || input.includes('cost') || input.includes('fee') || input.includes('charges')) {
      return "Our pricing is transparent! 💰\n\nTable booking:\n• Restaurant base price per person\n• 20% advance payment\n• No hidden charges\n\nFood delivery:\n• Menu prices + delivery fee\n• Free delivery on orders above ₹200\n• No service charges\n\nEvent planning:\n• Venue cost + 50% surcharge\n• 20% advance payment\n• Transparent pricing\n\nNeed specific pricing details?";
    }
    
    // Cancellation & refunds
    if (input.includes('cancel') || input.includes('refund') || input.includes('change') || input.includes('modify')) {
      return "Cancellation policies are fair! 📋\n\nTable bookings:\n• 24+ hours: Full refund\n• 12-24 hours: 50% refund\n• Less than 12 hours: No refund\n\nFood orders:\n• Before preparation: Full refund\n• During preparation: 50% refund\n• After dispatch: No refund\n\nEvent bookings:\n• 48+ hours: Full refund\n• 24-48 hours: 50% refund\n• Less than 24 hours: No refund\n\nNeed to modify a booking?";
    }
    
    // Default response
    return "I'm here to help with anything Tabuloo-related! 🎯\n\nYou can ask me about:\n• Platform features and services\n• How to use different features\n• Payment and pricing\n• Restaurant information\n• Event planning\n• Account management\n• Technical support\n• Contact information\n\nWhat would you like to know more about?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-800 to-red-900 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <h3 className="font-semibold">Tabuloo Support</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'bot' && (
                    <Bot className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <User className="h-4 w-4 text-red-100 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-1">
                  <Bot className="h-4 w-4 text-red-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Tabuloo..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSupportChat;
