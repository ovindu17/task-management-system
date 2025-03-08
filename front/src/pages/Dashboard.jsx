import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ChatTaskCard from '../components/ChatTaskCard';
import Button from '../components/Button';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Chat related state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      setChatPanelWidth(newWidth);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Helper function to format the response
  const formatResponse = (response) => {
    try {
        //if response contains html, format it so it can be displayed in the chat
        if (response.includes('<') && response.includes('>')) {
            return (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: response
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove any script tags
                    .replace(/on\w+="[^"]*"/g, '') // Remove any inline event handlers
                }} 
              />
            );
          }
        
        if (response.includes('Provide task details:')) {

            const introText = response;
            
            return(
     
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {introText && <p className="mb-4 text-sm text-gray-600">{introText}</p>}

      <form className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="3"
            placeholder="Enter task description"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            
            variant="outline"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Add Task
          </Button>
        </div>
      </form>
    </div>
 
            )
        }
      // Check if the response contains task data
      if (response.includes('Task:')) {
        // Split the response into parts (text and tasks)
        const parts = response.split('Task:');
        const introText = parts[0];
        
        // Process each task section
        const taskComponents = parts.slice(2).map((taskSection, index) => {
          // Extract task data from the formatted text
          const lines = taskSection.trim().split('\n');
          const taskData = {
            id: parseInt(lines.find(l => l.includes('ID:'))?.split('ID:')[1].trim() || '0'),
            title: lines.find(l => l.includes('Title:'))?.split('Title:')[1].trim() || '',
            description: lines.find(l => l.includes('Description:'))?.split('Description:')[1].trim() || '',
            status: lines.find(l => l.includes('Status:'))?.split('Status:')[1].trim() || '',
            created_at: lines.find(l => l.includes('Created:'))?.split('Created:')[1].trim() || '',
            updated_at: lines.find(l => l.includes('Updated:'))?.split('Updated:')[1].trim() || ''
          };
          
          return (
            <ChatTaskCard
              key={taskData.id}
              task={{
                ...taskData,
                completed: taskData.status === 'completed'
              }}
              onPreview={handlePreview}
            />
          );
        });

        // Return the formatted response with task cards
        return (
          <div>
            {introText && <p className="mb-4 text-sm text-gray-600">{introText}</p>}
            {taskComponents}
          </div>
        );
      }
      
      // If no task data, return the original response
      return response;
    } catch (error) {
      console.error('Error formatting response:', error);
      return response;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5001/tasks');
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleNewTask = () => {
    // TODO: Implement new task creation
    console.log('Create new task');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
  };

  const handlePreview = (task) => {
    // TODO: Implement task preview
    console.log('Preview task:', task);
  };

  const handleChatSubmit = async (message) => {
    setChatLoading(true);
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await fetch('http://localhost:5001/adv-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, {
        role: 'bot',
        content: formatResponse(data.response)
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Error: Unable to process your request'
      }]);
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.id - b.id;
        case 'completed':
          return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
        case 'newest':
        default:
          return b.id - a.id;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleNewTask}
            variant="primary"
          >
            + New Task
          </Button>
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant={isChatOpen ? "primary" : "outline"}
          >
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </Button>
        </div>
      </nav>

      <div className="flex">
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-[400px]' : ''}`}>
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <SearchBar 
                onSearch={handleSearch}
                onSort={handleSort}
              />
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading tasks...</div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onPreview={handlePreview}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Side Panel */}
        <div 
          className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ width: `${chatPanelWidth}px` }}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-indigo-500 hover:opacity-50 transition-colors"
            onMouseDown={handleMouseDown}
          />
          <div className="flex flex-col h-screen">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} loading={chatLoading} />
            </div>
            <div className="border-t border-gray-200">
              <ChatInput
                input={chatInput}
                setInput={setChatInput}
                onSubmit={handleChatSubmit}
                loading={chatLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;