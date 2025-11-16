import React, { useState } from 'react';
import { JournalEntry } from '../types';

interface JournalProps {
  onAddEntry: (text: string) => void;
  entries: JournalEntry[];
}

const Journal: React.FC<JournalProps> = ({ onAddEntry, entries }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onAddEntry(text);
    setText('');
  };
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 flex flex-col h-full">
      <h3 className="font-semibold text-gray-300 mb-3">Daily Journal</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write about your thoughts and feelings..."
        className="flex-grow bg-gray-900/70 p-3 rounded-md text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        rows={5}
      ></textarea>
      <button 
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="mt-3 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Save Entry
      </button>
    </div>
  );
};

export default Journal;