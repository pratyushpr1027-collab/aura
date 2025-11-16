import React, { useState } from 'react';
import useWellnessData from '../hooks/useIotData';
import Sidebar, { View } from './Sidebar';
import AiAssistant from './AiAssistant';
import AnalysisPanel from './Goals';
import SensorCard from './SensorCard';
import BiometricCard from './BiometricCard';
import EnvironmentCard from './EnvironmentCard';
import ChartCard from './ChartCard';
import ActivityTracker from './ActivityTracker';
import Journal from './ThermostatControl';
import BreathingExercise from './BreathingExercise';
import GoalsSummaryCard from './GoalsSummaryCard';
import { Message, Analysis, Goal } from '../types';
import { analyzeAndRespond } from '../services/geminiService';

// --- Sub-component for Goals Page ---
interface GoalsPageProps {
  goals: Goal[];
  onAddGoal: (text: string) => void;
  onToggleGoal: (id: string) => void;
}
const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onAddGoal, onToggleGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');
  const handleAddGoal = () => { if (newGoalText.trim()) { onAddGoal(newGoalText); setNewGoalText(''); } };
  const completedGoals = goals.filter(g => g.completed);
  const incompleteGoals = goals.filter(g => !g.completed);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-6 animate-[slideInUp_0.5s_ease-out]">Your Goals</h1>
      <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 mb-6 animate-[slideInUp_0.5s_ease-out] [animation-delay:100ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h2 className="text-xl font-semibold text-gray-200 mb-3">Add a New Goal</h2>
        <div className="flex gap-2">
          <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()} placeholder="e.g., Meditate for 5 minutes daily" className="flex-grow bg-gray-900/70 p-3 rounded-md text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <button onClick={handleAddGoal} disabled={!newGoalText.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Goal</button>
        </div>
      </div>
      <div className="space-y-6 animate-[slideInUp_0.5s_ease-out] [animation-delay:200ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">In Progress ({incompleteGoals.length})</h2>
          <div className="space-y-2">{incompleteGoals.length > 0 ? incompleteGoals.map(goal => (<GoalItem key={goal.id} goal={goal} onToggle={onToggleGoal} />)) : <p className="text-gray-500 italic">No active goals. Add one above!</p>}</div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">Completed ({completedGoals.length})</h2>
          <div className="space-y-2">{completedGoals.length > 0 ? completedGoals.map(goal => (<GoalItem key={goal.id} goal={goal} onToggle={onToggleGoal} />)) : <p className="text-gray-500 italic">No completed goals yet.</p>}</div>
        </div>
      </div>
    </div>
  );
};
const GoalItem: React.FC<{ goal: Goal; onToggle: (id: string) => void }> = ({ goal, onToggle }) => (
  <div className={`flex items-center p-3 rounded-lg transition-all duration-300 ${goal.completed ? 'bg-gray-800/40 text-gray-500' : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700/60'}`}>
    <button onClick={() => onToggle(goal.id)} className="flex-shrink-0 w-6 h-6 mr-4 rounded border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-teal-400">{goal.completed && <i className="fas fa-check text-teal-400"></i>}</button>
    <span className={`flex-grow ${goal.completed ? 'line-through' : ''}`}>{goal.text}</span>
  </div>
);

// --- Main View Components ---
const WellnessDashboardView: React.FC<{ wellnessData: ReturnType<typeof useWellnessData>, setView: (view: View) => void }> = ({ wellnessData, setView }) => {
    const { data, addMoodLog, addActivityLog } = wellnessData;
    
    // Animate-in classes and styles
    const cardBaseClass = "card-glow-effect animate-[slideInUp_0.5s_ease-out] opacity-0 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50";
    const animationFill = { animationFillMode: 'forwards' as const };

    return (
        <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 h-full overflow-y-auto">
            <div className={`${cardBaseClass} lg:col-span-2 xl:col-span-3`} style={{ ...animationFill, animationDelay: '100ms' }}> <ChartCard moodLogs={data.moodLogs} biometricHistory={data.biometricHistory} /> </div>
            <div className={`${cardBaseClass} lg:row-span-2`} style={{ ...animationFill, animationDelay: '200ms' }}> <SensorCard onLogMood={addMoodLog} data={data} /> </div>
            <div className={cardBaseClass} style={{ ...animationFill, animationDelay: '300ms' }}> <BiometricCard data={data.biometrics} activityLevel={data.activityLevel} /> </div>
            <div className={cardBaseClass} style={{ ...animationFill, animationDelay: '400ms' }}> <EnvironmentCard data={data.environment} /> </div>
            <div className={`${cardBaseClass} md:col-span-2 lg:col-span-1`} style={{ ...animationFill, animationDelay: '500ms' }}> <ActivityTracker onLogActivity={addActivityLog} /> </div>
             <div className={`${cardBaseClass} lg:col-span-2 xl:col-span-2`} style={{ ...animationFill, animationDelay: '700ms' }}>
                 <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 flex flex-col h-full">
                    <h3 className="font-semibold text-gray-300 mb-3">Latest Journal Entry</h3>
                    {data.journalEntries.length > 0 ? (
                        <div className="text-sm text-gray-400 space-y-2 flex-grow overflow-hidden">
                             <p className="text-xs text-gray-500">{new Date(data.journalEntries[0].timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                             <p className="whitespace-pre-wrap line-clamp-3">{data.journalEntries[0].text}</p>
                        </div>
                    ) : <p className="text-gray-500 text-sm flex-grow flex items-center justify-center">No journal entries yet.</p>}
                    <button onClick={() => setView('journal')} className="mt-3 w-full text-sm bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">View Full Journal</button>
                 </div>
            </div>
            <div className={`${cardBaseClass} lg:col-span-2 xl:col-span-1`} style={{ ...animationFill, animationDelay: '800ms' }}> <BreathingExercise isDashboardWidget={true} onNavigate={() => setView('breathe')} /> </div>
            <div className={`${cardBaseClass} md:col-span-2 lg:col-span-3 xl:col-span-4`} style={{ ...animationFill, animationDelay: '600ms' }}> <GoalsSummaryCard goals={data.goals} onNavigate={() => setView('goals')} /> </div>
        </div>
    );
};

const AssistantView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'model', text: 'Hello, I am your personal AI therapist. How are you feeling today?' }]);
    const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSendMessage = async (text: string) => {
        setIsLoading(true);
        setCurrentAnalysis(null);
        const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        try {
            const { response, analysis } = await analyzeAndRespond(messages, text);
            const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response };
            setMessages(prev => [...prev, modelMessage]);
            setCurrentAnalysis(analysis);
        } catch (error) { console.error("Failed to get response from AI", error); setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]); } 
        finally { setIsLoading(false); }
    };
    return (
         <div className="flex-1 flex overflow-hidden h-full">
            <main className="flex-1 overflow-y-auto"> <AiAssistant messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} /> </main>
            <aside className="w-80 lg:w-96 bg-gray-900/70 border-l border-gray-800 p-4 lg:p-6 overflow-y-auto hidden md:block"> <AnalysisPanel analysis={currentAnalysis} isLoading={isLoading} /> </aside>
        </div>
    );
};

// --- Main Component ---
const ChatDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const wellnessData = useWellnessData();
    
    const renderContent = () => {
        let viewContent;
        switch (activeView) {
            case 'dashboard': viewContent = <WellnessDashboardView wellnessData={wellnessData} setView={setActiveView} />; break;
            case 'assistant': viewContent = <AssistantView />; break;
            case 'journal': viewContent = <Journal onAddEntry={wellnessData.addJournalEntry} entries={wellnessData.data.journalEntries} />; break;
            case 'goals': viewContent = <GoalsPage goals={wellnessData.data.goals} onAddGoal={wellnessData.addGoal} onToggleGoal={wellnessData.toggleGoal} />; break;
            case 'breathe': viewContent = <div className="p-4 md:p-8 h-full"><BreathingExercise isDashboardWidget={false} /></div>; break;
            default: viewContent = <WellnessDashboardView wellnessData={wellnessData} setView={setActiveView} />;
        }
        return (
          <div key={activeView} className="h-full w-full animate-[slideInFromRight_0.5s_ease-in-out]">
            {viewContent}
          </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-transparent text-gray-200">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-800 p-4 text-center md:hidden">
                    <h1 className="text-xl font-semibold text-white">Haven</h1>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

export default ChatDashboard;