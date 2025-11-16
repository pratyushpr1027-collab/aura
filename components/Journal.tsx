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
    <div className="flex flex-col h-full gap-6">
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">New Journal Entry</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write about your thoughts and feelings..."
          className="bg-gray-900/70 p-3 rounded-md text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          rows={6}
        ></textarea>
        <button 
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Save Entry
        </button>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Past Entries</h3>
          <div className="space-y-4 overflow-y-auto flex-grow">
            {entries.length > 0 ? (
                entries.map(entry => (
                    <div key={entry.id} className="bg-gray-700/60 p-4 rounded-lg animate-fade-in">
                        <p className="font-semibold text-gray-200">{entry.title}</p>
                        <p className="text-sm text-gray-400 mb-2">{new Date(entry.timestamp).toLocaleString()}</p>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{entry.text}</p>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 py-8 h-full flex flex-col justify-center items-center">
                    <i className="fas fa-book-open text-4xl mb-4"></i>
                    <p>Your journal is empty. Write an entry to begin.</p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Journal;