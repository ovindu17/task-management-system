import React from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`my-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
};

export default MessageBubble; 