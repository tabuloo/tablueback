import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import GeneralSupportChat from './GeneralSupportChat';

const FloatingChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-full shadow-lg hover:from-red-900 hover:to-red-950 transition-all duration-300 z-40 flex items-center justify-center group"
        title="Get Tabuloo Support"
      >
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        
        {/* Pulse animation when chat is closed */}
        {!isChatOpen && (
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></div>
        )}
        
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Need help? Chat with us!
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>
      </button>

      {/* Chat Interface */}
      <GeneralSupportChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default FloatingChatButton;
