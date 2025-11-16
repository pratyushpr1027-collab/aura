import React from 'react';
import { Activity } from '../types';

interface ActivityTrackerProps {
  onLogActivity: (activity: Activity) => void;
}

const activities: { name: Activity, icon: string }[] = [
    { name: 'Meditate', icon: 'fa-om' },
    { name: 'Exercise', icon: 'fa-dumbbell' },
    { name: 'Journal', icon: 'fa-pencil-alt' },
    { name: 'Socialize', icon: 'fa-users' },
    { name: 'Work', icon: 'fa-briefcase' },
    { name: 'Hobby', icon: 'fa-paint-brush' },
];

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ onLogActivity }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50">
      <h3 className="font-semibold text-gray-300 mb-3">What have you been up to?</h3>
      <div className="grid grid-cols-3 gap-2">
        {activities.map(({ name, icon }) => (
          <button
            key={name}
            onClick={() => onLogActivity(name)}
            className="flex items-center justify-start p-3 rounded-lg bg-gray-700 hover:bg-teal-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-left"
            aria-label={`Log activity: ${name}`}
          >
            <i className={`fas ${icon} w-6 text-teal-300`}></i>
            <span className="text-sm text-gray-300">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityTracker;