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
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
        <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-white mb-6">Your Journal</h1>
            <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 mb-6">
                <h3 className="font-semibold text-gray-300 mb-3">New Entry</h3>
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
                    className="mt-3 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Save Entry
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Past Entries</h2>
            <div className="space-y-4">
                {entries.length > 0 ? (
                    entries.map(entry => (
                        <div key={entry.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-gray-400 mb-2">
                                {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                            <p className="text-gray-300 whitespace-pre-wrap">{entry.text}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        <i className="fas fa-book-reader text-4xl mb-4"></i>
                        <p>Your journal is empty.</p>
                        <p>Write your first entry above to get started.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Journal;