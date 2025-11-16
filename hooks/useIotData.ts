import { useState, useEffect, useCallback, useRef } from 'react';
import { MentalHealthData, Mood, Activity, JournalEntry, MoodLog, ActivityLog, BiometricData, EnvironmentData, ActivityLevel, BiometricHistoryEntry, Recommendation, Goal } from '../types';

const LOCAL_STORAGE_KEY = 'haven-mental-health-data';

const getInitialState = (): MentalHealthData => {
  const defaultState: MentalHealthData = {
    moodLogs: [],
    activityLogs: [],
    journalEntries: [],
    goals: [],
    biometrics: { heartRate: 70, gsr: 400 },
    environment: { temperature: 22, humidity: 45, light: 500 },
    activityLevel: 'Sedentary',
    biometricHistory: [],
  };

  try {
    const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Ensure all keys from defaultState are present to avoid errors after updates
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error("Could not load data from local storage", error);
  }
  return defaultState;
};

export const moodMapping: Record<Mood, { value: number; color: string; icon: string }> = {
    'Happy': { value: 5, color: '#F6E05E', icon: 'fa-smile' },
    'Calm': { value: 4, color: '#38B2AC', icon: 'fa-leaf' },
    'Neutral': { value: 3, color: '#A0AEC0', icon: 'fa-meh' },
    'Surprised': { value: 3, color: '#A78BFA', icon: 'fa-surprise' }, // Purple
    'Tired': { value: 2, color: '#94A3B8', icon: 'fa-battery-quarter' }, // Slate
    'Anxious': { value: 2, color: '#F56565', icon: 'fa-bolt' },
    'Stressed': { value: 2, color: '#F97316', icon: 'fa-fire' }, // Orange
    'Sad': { value: 1, color: '#63B3ED', icon: 'fa-sad-tear' },
    'Angry': { value: 1, color: '#DC2626', icon: 'fa-angry' }, // Darker Red
};

const useWellnessData = () => {
  const [data, setData] = useState<MentalHealthData>(getInitialState);
  const moodInfluence = useRef(0); // -1 for sad/anxious, 1 for happy/calm, 0 for neutral

  // Save data to local storage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Could not save data to local storage", error);
    }
  }, [data]);

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        // Biometric simulation
        const hrFluctuation = (Math.random() - 0.5) * 4;
        const gsrFluctuation = (Math.random() - 0.5) * 40;
        let baseHeartRate = 70;
        let baseGsr = 450;

        // Influence from mood
        if (moodInfluence.current < 0) { // Stressed/Sad
            baseHeartRate = 85;
            baseGsr = 650;
        } else if (moodInfluence.current > 0) { // Happy/Calm
            baseHeartRate = 65;
            baseGsr = 350;
        }

        const newBiometrics: BiometricData = {
          heartRate: Math.round(baseHeartRate + hrFluctuation),
          gsr: Math.round(baseGsr + gsrFluctuation),
        };

        // Environment simulation
        const newEnvironment: EnvironmentData = {
          temperature: parseFloat((22 + (Math.random() - 0.5) * 2).toFixed(1)),
          humidity: Math.round(45 + (Math.random() - 0.5) * 10),
          light: Math.round(500 + (Math.random() - 0.5) * 200),
        };

        // Activity simulation
        const activityLevels: ActivityLevel[] = ['Sedentary', 'Light', 'Active'];
        const newActivityLevel = Math.random() < 0.05 ? activityLevels[Math.floor(Math.random() * 3)] : prevData.activityLevel;
        
        const newHistoryEntry: BiometricHistoryEntry = {
            ...newBiometrics,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const biometricHistory = [...prevData.biometricHistory, newHistoryEntry].slice(-50); // Keep last 50 data points

        return { ...prevData, biometrics: newBiometrics, environment: newEnvironment, activityLevel: newActivityLevel, biometricHistory };
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);


  const addMoodLog = useCallback((mood: Mood, insight?: string, recommendation?: Recommendation) => {
    const moodValue = moodMapping[mood].value;
    if (moodValue <= 2) moodInfluence.current = -1;
    else if (moodValue >= 4) moodInfluence.current = 1;
    else moodInfluence.current = 0;

    // Reset influence after a while
    setTimeout(() => { moodInfluence.current = 0 }, 60000); // Reset after 1 minute

    setData(prevData => {
      const newLog: MoodLog = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood,
        value: moodValue,
        insight,
        recommendation,
      };
      const moodLogs = [...prevData.moodLogs, newLog].slice(-50);
      return { ...prevData, moodLogs };
    });
  }, []);

  const addActivityLog = useCallback((activity: Activity) => {
    setData(prevData => {
      const newLog: ActivityLog = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        activity,
      };
      const activityLogs = [...prevData.activityLogs, newLog];
      return { ...prevData, activityLogs };
    });
  }, []);

  const addJournalEntry = useCallback((text: string) => {
    setData(prevData => {
       if (!text.trim()) return prevData;
      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        text,
      };
      const journalEntries = [newEntry, ...prevData.journalEntries].slice(0, 50);
      return { ...prevData, journalEntries };
    });
  }, []);
  
  const addGoal = useCallback((text: string) => {
    setData(prevData => {
        if (!text.trim()) return prevData;
        const newGoal: Goal = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            text,
            completed: false,
        };
        const goals = [newGoal, ...prevData.goals];
        return { ...prevData, goals };
    });
  }, []);

  const toggleGoal = useCallback((id: string) => {
      setData(prevData => {
          const goals = prevData.goals.map(goal =>
              goal.id === id ? { ...goal, completed: !goal.completed } : goal
          );
          return { ...prevData, goals };
      });
  }, []);

  return { data, addMoodLog, addActivityLog, addJournalEntry, addGoal, toggleGoal };
};

export default useWellnessData;