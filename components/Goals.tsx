import React, { useState } from 'react';
import { Goal } from '../types';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (text: string) => void;
  onToggleGoal: (id: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onToggleGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText);
      setNewGoalText('');
    }
  };

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Your Wellness Goals</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="font-semibold text-teal-400">{Math.round(progress)}%</span>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
          placeholder="Set a new goal (e.g., Meditate 10 mins)"
          className="flex-grow bg-gray-900/70 p-3 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={handleAddGoal}
          disabled={!newGoalText.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-grow">
        {goals.length > 0 ? (
          goals.map(goal => (
            <div
              key={goal.id}
              onClick={() => onToggleGoal(goal.id)}
              className={`p-4 rounded-lg flex items-center cursor-pointer transition-all duration-200 ${
                goal.completed ? 'bg-gray-700/50 text-gray-500 line-through' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <i className={`fas ${goal.completed ? 'fa-check-circle text-teal-500' : 'fa-circle'} mr-4 text-xl transition-all`}></i>
              <span className="flex-grow">{goal.text}</span>
              <span className="text-xs text-gray-500">{new Date(goal.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 h-full flex flex-col justify-center items-center">
            <i className="fas fa-bullseye text-4xl mb-4"></i>
            <p>No goals set yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;