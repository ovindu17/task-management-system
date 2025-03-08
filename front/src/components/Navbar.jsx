import React from 'react';

const Navbar = ({ title, onNewTask }) => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>
      <div>
        <button 
          onClick={onNewTask}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Task
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 