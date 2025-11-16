import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{ icon: string; label: string; viewName: string; activeView: string; onClick: () => void }> = ({ icon, label, viewName, activeView, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      activeView === viewName
        ? 'bg-teal-600/30 text-teal-300'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    <i className={`fas ${icon} w-6 text-center text-lg`}></i>
    <span className="font-semibold">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-gray-800/50 p-4 border-r border-gray-700/50 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <i className="fas fa-spa text-3xl text-teal-400"></i>
        <h1 className="text-2xl font-bold tracking-tight text-white">Haven</h1>
      </div>
      <nav className="space-y-2">
        <NavItem icon="fa-tachometer-alt" label="Dashboard" viewName="dashboard" activeView={activeView} onClick={() => setActiveView('dashboard')} />
        <NavItem icon="fa-book-open" label="Journal" viewName="journal" activeView={activeView} onClick={() => setActiveView('journal')} />
        <NavItem icon="fa-bullseye" label="Goals" viewName="goals" activeView={activeView} onClick={() => setActiveView('goals')} />
        <NavItem icon="fa-chart-line" label="History" viewName="history" activeView={activeView} onClick={() => setActiveView('history')} />
      </nav>
    </aside>
  );
};

export default Sidebar;