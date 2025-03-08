import React from 'react';
import Button from './Button';

const ChatInput = ({ input, setInput, onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
        />
        <Button 
          type="submit"
          disabled={loading}
          isLoading={loading}
          variant="primary"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatInput; 