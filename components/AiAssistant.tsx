import React, { useState, useRef, useEffect } from 'react';

interface Message {
  author: 'user' | 'ai' | 'system';
  text: string;
}

interface AiAssistantProps {
  onSendCommand: (command: string, addMessage: (author: 'user' | 'ai' | 'system', text: string) => void) => Promise<void>;
  isLoading: boolean;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onSendCommand, isLoading }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      { author: 'ai', text: "Welcome to Haven. I'm here to support you on your wellness journey. How are you feeling today?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (author: 'user' | 'ai' | 'system', text: string) => {
    setMessages(prev => [...prev, { author, text }]);
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      addMessage('user', input);
      onSendCommand(input, addMessage);
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-4">
      <div className="container mx-auto">
        <div className="max-h-48 overflow-y-auto mb-2 pr-2">
            {messages.map((msg, index) => (
                <div key={index} className={`mb-2 text-sm flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.author === 'ai' && <i className="fas fa-spa text-teal-400 mr-2 mt-1"></i>}
                    <div className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md ${
                        msg.author === 'user' ? 'bg-teal-600 text-white' : 
                        msg.author === 'system' ? 'bg-gray-700 text-gray-300 italic' : 'bg-gray-700 text-gray-200'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="mb-2 text-sm flex justify-start">
                    <i className="fas fa-spa text-teal-400 mr-2 mt-1"></i>
                    <div className="rounded-lg px-3 py-2 max-w-xs md:max-w-md bg-gray-700 text-gray-200">
                        <span className="animate-pulse">Thinking...</span>
                    </div>
                </div>
            )}
             <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center bg-gray-800 rounded-full p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Talk about your day or ask for insights..."
            className="flex-grow bg-transparent text-white px-4 py-2 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;