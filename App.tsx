import React, { useState, useCallback } from 'react';
import useWellnessData from './hooks/useIotData';
import AiAssistant from './components/AiAssistant';
import { handleAiCommand } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Goals from './components/Goals';
import ChartCard from './components/ChartCard';

const App: React.FC = () => {
  const { data, addMoodLog, addActivityLog, addJournalEntry, addGoal, toggleGoal } = useWellnessData();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const processAiCommand = useCallback(async (command: string, addMessage: (author: 'user' | 'ai' | 'system', text: string) => void) => {
    setIsAiLoading(true);
    try {
      const result = await handleAiCommand(command, data);
      if (result.action === 'respond') {
        addMessage('ai', result.payload.text);
      }
    } catch (error) {
      console.error("Error processing AI command:", error);
      addMessage('system', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [data]);

  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return <Dashboard 
                  data={data} 
                  onLogMood={addMoodLog} 
                  onLogActivity={addActivityLog}
                  setActiveView={setActiveView as (view: 'goals') => void}
                />;
      case 'journal':
        return <Journal entries={data.journalEntries} onAddEntry={addJournalEntry} />;
      case 'goals':
        return <Goals goals={data.goals} onAddGoal={addGoal} onToggleGoal={toggleGoal} />;
      case 'history':
        return <ChartCard moodLogs={data.moodLogs} biometricHistory={data.biometricHistory} />;
      default:
        return <Dashboard 
                  data={data} 
                  onLogMood={addMoodLog} 
                  onLogActivity={addActivityLog}
                  setActiveView={setActiveView as (view: 'goals') => void}
                />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
      <AiAssistant onSendCommand={processAiCommand} isLoading={isAiLoading} />
    </div>
  );
};

export default App;