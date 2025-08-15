import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EventPlanningChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventPlanningChat: React.FC<EventPlanningChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm your Tabuloo Event Planning Assistant. I can help you with venue selection, booking, pricing, and any questions about planning your perfect event. What would you like to know?",
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
    
    // Venue selection help
    if (input.includes('venue') || input.includes('restaurant') || input.includes('place')) {
      return "Great question! For venue selection, consider:\n• Guest count and capacity\n• Location and accessibility\n• Budget and pricing\n• Event type and atmosphere\n• Available dates and time slots\n\nWould you like me to help you find the perfect venue?";
    }
    
    // Pricing questions
    if (input.includes('price') || input.includes('cost') || input.includes('money') || input.includes('₹')) {
      return "Event pricing includes:\n• Base venue cost per person\n• 50% event surcharge\n• 20% advance payment required\n• Remaining balance on event day\n\nFor example: 50 people × ₹200 = ₹10,000 base + ₹5,000 surcharge = ₹15,000 total. Advance: ₹3,000";
    }
    
    // Booking process
    if (input.includes('book') || input.includes('reserve') || input.includes('confirm')) {
      return "Here's how to book your event:\n1. Select your venue\n2. Choose date and time\n3. Enter attendee details\n4. Make advance payment (20%)\n5. Receive confirmation\n\nNeed help with any specific step?";
    }
    
    // Cancellation policy
    if (input.includes('cancel') || input.includes('refund') || input.includes('change')) {
      return "Cancellation policy:\n• 48+ hours before: Full refund\n• 24-48 hours: 50% refund\n• Less than 24 hours: No refund\n\nDate changes are free if made 7+ days in advance. Need to modify your booking?";
    }
    
    // General event planning
    if (input.includes('plan') || input.includes('organize') || input.includes('arrange')) {
      return "Event planning checklist:\n• Set budget and guest count\n• Choose venue and date\n• Plan menu and catering\n• Arrange decorations\n• Send invitations\n• Confirm final details\n\nWhich area would you like help with?";
    }
    
    // Default response
    return "I'm here to help with your event planning! You can ask me about:\n• Venue selection and availability\n• Pricing and payment options\n• Booking process and requirements\n• Cancellation policies\n• Event planning tips\n\nWhat specific help do you need?";
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
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Event Planning Support</h3>
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
              placeholder="Type your message..."
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

export default EventPlanningChat;
