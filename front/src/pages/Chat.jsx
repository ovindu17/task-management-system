import React, { useState } from 'react';
import ChatNavbar from '../components/ChatNavbar';
import ChatSidebar from '../components/ChatSidebar';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleSubmit = async (message) => {
    setLoading(true);
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add an initial bot message that we'll update
      setMessages(prev => [...prev, { role: 'bot', content: '' }]);

      const updateLatestBotMessage = (additionalContent) => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: newMessages[newMessages.length - 1].content + additionalContent
          };
          return newMessages;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            updateLatestBotMessage(content);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Error: Unable to process your request'
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  // Mock recent chats data
  const recentChats = [
    { title: 'Previous Chat 1' },
    { title: 'Previous Chat 2' },
    { title: 'Previous Chat 3' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <ChatNavbar onNewChat={handleNewChat} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <ChatSidebar recentChats={recentChats} />
          
          <div className="flex-1">
            <div className="rounded-lg border border-gray-200 bg-white">
              <MessageList messages={messages} loading={loading} />
              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 