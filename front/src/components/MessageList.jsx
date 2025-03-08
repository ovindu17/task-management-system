import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, loading }) => {
  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {typeof message.content === 'string' ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              message.content
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 text-gray-500">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList; 