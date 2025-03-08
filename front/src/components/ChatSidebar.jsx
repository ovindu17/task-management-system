import React from 'react';

const ChatSidebar = ({ recentChats }) => {
  return (
    <div className="w-64 shrink-0">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-900">Recent Chats</h2>
          <div className="mt-4 space-y-2">
            {recentChats?.map((chat, index) => (
              <div key={index} className="cursor-pointer p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{chat.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 