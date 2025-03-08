import React from 'react';

const SearchBar = ({ onSearch, onSort }) => {
  return (
    <div className="flex gap-4">
      <div>
        <input
          type="text"
          placeholder="Search tasks..."
          onChange={(e) => onSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <select 
        onChange={(e) => onSort(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="newest">Sort by: Newest</option>
        <option value="oldest">Sort by: Oldest</option>
        <option value="completed">Sort by: Completed</option>
      </select>
    </div>
  );
};

export default SearchBar; 