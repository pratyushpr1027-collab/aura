import React from 'react';
import { Goal } from '../types';

interface GoalsSummaryCardProps {
  goals: Goal[];
  onNavigate: () => void;
}

const GoalsSummaryCard: React.FC<GoalsSummaryCardProps> = ({ goals, onNavigate }) => {
  const incompleteGoals = goals.filter(g => !g.completed).slice(0, 3);
  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col">
      <h3 className="font-semibold text-gray-300 mb-3">Goal Progress ({completedCount}/{totalCount})</h3>
      <div className="flex-grow space-y-2">
        {totalCount > 0 ? (
            incompleteGoals.length > 0 ? (
              incompleteGoals.map(goal => (
                <div key={goal.id} className="flex items-center text-sm text-gray-300">
                  <i className="far fa-circle mr-3 text-teal-400"></i>
                  <span>{goal.text}</span>
                </div>
              ))
            ) : (
                <div className="text-center text-gray-500 flex flex-col justify-center items-center h-full">
                    <i className="fas fa-check-double text-2xl mb-2 text-teal-500"></i>
                    <span>All goals complete!</span>
                </div>
            )
        ) : (
            <div className="text-center text-gray-500 flex flex-col justify-center items-center h-full">
                <i className="fas fa-bullseye text-2xl mb-2"></i>
                <span>No goals set.</span>
            </div>
        )}
      </div>
      <button onClick={onNavigate} className="mt-3 w-full text-sm bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        View All Goals
      </button>
    </div>
  );
};

export default GoalsSummaryCard;