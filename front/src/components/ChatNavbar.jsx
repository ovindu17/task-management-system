import React from 'react';
import Button from './Button';

const ChatNavbar = ({ onNewChat }) => {
  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-semibold">Assistant</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={onNewChat} variant="primary">
              New chat
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ChatNavbar; 