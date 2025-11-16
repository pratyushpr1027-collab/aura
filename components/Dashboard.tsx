import React from 'react';
import { MentalHealthData, Mood, Activity, Recommendation } from '../types';
import SensorCard from './SensorCard';
import ActivityTracker from './ActivityTracker';
import ChartCard from './ChartCard';
import BiometricCard from './BiometricCard';
import EnvironmentCard from './EnvironmentCard';
import GoalsSummaryCard from './GoalsSummaryCard';

interface DashboardProps {
  data: MentalHealthData;
  onLogMood: (mood: Mood, insight?: string, recommendation?: Recommendation) => void;
  onLogActivity: (activity: Activity) => void;
  setActiveView: (view: 'goals') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onLogMood, onLogActivity, setActiveView }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      <div className="lg:col-span-2">
        <SensorCard onLogMood={onLogMood} data={data} />
      </div>
      <div className="lg:col-span-1">
          <BiometricCard data={data.biometrics} activityLevel={data.activityLevel} />
      </div>
       <div className="lg:col-span-1">
          <EnvironmentCard data={data.environment} />
      </div>

      <div className="lg:col-span-2">
        <ActivityTracker onLogActivity={onLogActivity} />
      </div>
      <div className="lg:col-span-2">
        <GoalsSummaryCard goals={data.goals} onNavigate={() => setActiveView('goals')} />
      </div>
      
      <div className="lg:col-span-4">
        <ChartCard moodLogs={data.moodLogs} biometricHistory={data.biometricHistory} />
      </div>
    </div>
  );
};

export default Dashboard;