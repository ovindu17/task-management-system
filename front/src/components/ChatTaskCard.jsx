import React, { useState } from 'react';
import Button from './Button';

const ChatTaskCard = ({ task, onPreview }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePreview = () => {
    setIsExpanded(!isExpanded);
    onPreview(task);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 shadow-sm">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-fit">
          <span className={`w-3 h-3 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-gray-700 text-xs whitespace-normal line-clamp-2 max-w-[100px]">{task.title}</span>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={handlePreview}
            variant={isExpanded ? "primary" : "outline"}
            size="sm"
          >
            {isExpanded ? 'Hide' : 'View'}
          </Button>
        </div>
      </div>
      
      {/* Description section - animated with height transition */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-48 border-t border-gray-100' : 'max-h-0'}
        `}
      >
        <div className="p-4 bg-gray-50">
          <p className="text-xs text-gray-600">{task.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatTaskCard;