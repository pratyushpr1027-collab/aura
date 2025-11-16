import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <i className="fas fa-spa text-2xl text-teal-400"></i>
            <h1 className="text-2xl font-bold tracking-tight text-white">Haven</h1>
        </div>
        <span className="text-sm text-gray-400">Your Mental Wellness Companion</span>
      </div>
    </header>
  );
};

export default Header;