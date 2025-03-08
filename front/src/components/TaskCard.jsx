import React, { useState } from 'react';
import Button from './Button';

const TaskCard = ({ task, onPreview, showEditButton = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePreview = () => {
    setIsExpanded(!isExpanded);
    onPreview(task);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg transition-all">
      <div className="p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-fit">
          <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs text-gray-600">{task.completed ? 'Completed' : 'In Progress'}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-medium text-sm text-gray-900 truncate">{task.title}</h3>
        </div>
        <div className="flex gap-2 min-w-fit">
          {showEditButton && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          )}
          <Button 
            onClick={handlePreview}
            variant={isExpanded ? "primary" : "outline"}
            size="sm"
          >
            {isExpanded ? 'Hide' : 'Preview'}
          </Button>
        </div>
      </div>
      
      {/* Description section - animated with height transition */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-40 border-t border-gray-100' : 'max-h-0'}
        `}
      >
        <div className="p-3 bg-gray-50">
          <p className="text-xs text-gray-600">{task.description}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;