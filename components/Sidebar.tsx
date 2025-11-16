import React from 'react';

export type View = 'dashboard' | 'assistant' | 'journal' | 'goals' | 'breathe';

interface ChatHistorySidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems: { id: View; name: string; icon: string }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-th-large' },
    { id: 'assistant', name: 'AI Assistant', icon: 'fa-brain' },
    { id: 'journal', name: 'Journal', icon: 'fa-book-open' },
    { id: 'goals', name: 'Goals', icon: 'fa-bullseye' },
    { id: 'breathe', name: 'Breathe', icon: 'fa-wind' },
];

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-gray-900 p-4 border-r border-gray-800 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="flex items-center gap-3 mb-8">
          <i className="fas fa-spa text-3xl text-teal-400"></i>
          <h1 className="text-2xl font-bold tracking-tight text-white">Haven</h1>
      </div>
      
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {navItems.map(item => (
            <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-4 text-sm font-medium transition-colors ${
                    activeView === item.id
                        ? 'bg-teal-600/80 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
                <i className={`fas ${item.icon} w-5 text-center text-lg`}></i>
                <span>{item.name}</span>
            </button>
        ))}
      </nav>

      <div className="mt-auto text-center text-gray-500 text-xs">
          <p>Your Mental Wellness Companion</p>
      </div>
    </aside>
  );
};

export default ChatHistorySidebar;